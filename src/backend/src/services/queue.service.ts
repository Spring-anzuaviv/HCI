import { activeStatuses } from "./order.service.js";
import { getStageDuration, getWorkflowStages } from "./scheduling.service.js";
import {
  asQueueDate,
  buildMachineRecommendation,
  compareSmartQueuePriority,
  evaluateQueueRisk,
  getRequiredMachineStage,
  type DateValue,
  type SmartQueueMachine,
  type SmartQueueOrder,
  type SmartQueueStage,
} from "./smart-queue.js";

type QueueStage = SmartQueueStage & { machine?: SmartQueueMachine | null };
type QueueOrder = SmartQueueOrder & { stages?: QueueStage[] };
type QueueMachine = SmartQueueMachine;
export type OperationalState = "NORMAL" | "NEEDS_REVIEW";

const expectedOrderStatusForRunningStage: Record<string, string> = {
  SORTING: "RECEIVED",
  WASH: "WASHING",
  TRANSFER: "WAITING",
  DRY: "DRYING",
  PACKING: "FOLDING_PACKING",
};

function getStageState(order: QueueOrder) {
  const stages = order.stages ?? [];
  const workflow = getWorkflowStages(order.serviceType);
  const runningStages = stages.filter((stage) => stage.status === "RUNNING");
  const reviewReasons: string[] = [];
  if (runningStages.length > 1) reviewReasons.push("Đơn có nhiều công đoạn RUNNING cùng lúc");

  const runningStage = runningStages[0] ?? null;
  if (runningStage) {
    const expectedStatus = expectedOrderStatusForRunningStage[runningStage.stage];
    if (!expectedStatus || order.status !== expectedStatus)
      reviewReasons.push(
        `Công đoạn ${runningStage.stage} đang RUNNING nhưng trạng thái đơn là ${order.status}`,
      );
  }
  if (stages.some((stage) => !workflow.includes(stage.stage)))
    reviewReasons.push("Đơn có công đoạn không thuộc workflow dịch vụ");
  const duplicateStages = workflow.filter(
    (name) => stages.filter((stage) => stage.stage === name).length > 1,
  );
  if (duplicateStages.length > 0)
    reviewReasons.push(`Công đoạn bị trùng: ${duplicateStages.join(", ")}`);

  const nextStageName = workflow.find((name) => {
    const stage = stages.find((item) => item.stage === name);
    return !stage || !["COMPLETED", "CANCELLED"].includes(stage.status);
  });
  const nextStage = nextStageName
    ? stages.find((stage) => stage.stage === nextStageName) ?? null
    : null;
  if (!runningStage && nextStageName && !nextStage)
    reviewReasons.push(`Thiếu dữ liệu công đoạn ${nextStageName}`);
  if (!nextStageName && !["READY", "NOTIFIED", "COMPLETED"].includes(order.status))
    reviewReasons.push("Các công đoạn đã xong nhưng trạng thái đơn chưa đồng bộ");
  if (nextStageName && ["READY", "NOTIFIED"].includes(order.status))
    reviewReasons.push(`Đơn ở trạng thái ${order.status} nhưng vẫn còn công đoạn chưa hoàn tất`);
  if (nextStage) {
    const index = workflow.indexOf(nextStage.stage);
    const incomplete = workflow.slice(0, index).filter(
      (name) => stages.find((stage) => stage.stage === name)?.status !== "COMPLETED",
    );
    if (incomplete.length > 0)
      reviewReasons.push(`Công đoạn trước chưa hoàn tất: ${incomplete.join(", ")}`);
  }
  const lastCompleted = [...workflow].reverse().find((name) =>
    stages.find((stage) => stage.stage === name)?.status === "COMPLETED"
  );
  return {
    nextStage,
    currentStage: runningStage?.stage ?? nextStage?.stage ?? lastCompleted ?? order.status,
    remainingStages: workflow.filter((name) =>
      stages.find((stage) => stage.stage === name)?.status !== "COMPLETED"
    ).length,
    reviewReasons,
  };
}

function compareDates(left: DateValue, right: DateValue) {
  return (asQueueDate(left)?.getTime() ?? Number.POSITIVE_INFINITY) -
    (asQueueDate(right)?.getTime() ?? Number.POSITIVE_INFINITY);
}

function getTaskTiming(order: QueueOrder, nextStage: QueueStage | null, machines: QueueMachine[], now: Date) {
  if (!nextStage) return { taskDeadlineAt: null, taskDelayMinutes: 0 };
  const machine = nextStage.machineId
    ? machines.find((item) => item.machineId === nextStage.machineId)
    : undefined;
  let taskDeadlineAt: Date | null = null;

  if (nextStage.status === "RUNNING") {
    const start = nextStage.actualStartedAt ? asQueueDate(nextStage.actualStartedAt) : null;
    taskDeadlineAt = start && machine ? new Date(start.getTime() + getStageDuration(nextStage.stage, machine) * 60_000) : asQueueDate(nextStage.plannedEndAt);
  } else if (nextStage.stage === "WASH" || nextStage.stage === "DRY") {
    // Với stage máy đang chờ, trễ nghĩa là chưa đưa mẻ vào đúng giờ bắt đầu.
    taskDeadlineAt = asQueueDate(nextStage.plannedStartAt);
  } else {
    // Stage thủ công có một khoảng thời gian để hoàn thành, không trễ ngay lúc vừa tạo đơn.
    taskDeadlineAt = asQueueDate(nextStage.plannedEndAt);
  }

  return {
    taskDeadlineAt,
    taskDelayMinutes: taskDeadlineAt ? Math.max(0, Math.floor((now.getTime() - taskDeadlineAt.getTime()) / 60_000)) : 0,
  };
}

export function buildQueueSnapshot(
  allOrders: QueueOrder[],
  machines: QueueMachine[],
  excludedOrderIds: number[] = [],
  now = new Date(),
) {
  const orders = allOrders.filter(
    (order) => activeStatuses.has(order.status) && !excludedOrderIds.includes(order.orderId),
  );
  const availableMachines = machines.filter((machine) => machine.status === "AVAILABLE");
  const machineRecommendations = availableMachines.map((machine) =>
    buildMachineRecommendation(orders, machine, now)
  );
  const candidateByOrder = new Map<number, Array<ReturnType<typeof buildMachineRecommendation>["candidates"][number]>>();
  for (const result of machineRecommendations) {
    for (const candidate of result.candidates)
      candidateByOrder.set(candidate.orderId, [
        ...(candidateByOrder.get(candidate.orderId) ?? []),
        candidate,
      ]);
  }

  const items = orders.map((order) => {
    const stageState = getStageState(order);
    const risk = evaluateQueueRisk(order.pickupAt, order.estimatedAt, now);
    const candidates = candidateByOrder.get(order.orderId) ?? [];
    const bestCandidate = [...candidates].sort((left, right) =>
      compareDates(left.createdAt, right.createdAt) || left.machineId - right.machineId
    )[0] ?? null;
    const scheduledMachineId = stageState.nextStage?.machineId ?? null;
    const scheduledMachine = scheduledMachineId
      ? machines.find((machine) => machine.machineId === scheduledMachineId) ?? null
      : null;
    const requirement = getRequiredMachineStage(order);
    const nextStageName = stageState.nextStage?.stage ?? requirement.stageName;
    const machineRequirement = requirement.stageName === nextStageName ? requirement : null;
    const taskTiming = getTaskTiming(order, stageState.nextStage, machines, now);
    const operationalState: OperationalState = stageState.reviewReasons.length > 0
      ? "NEEDS_REVIEW"
      : "NORMAL";
    return {
      orderId: order.orderId,
      customer: order.customer ?? null,
      status: order.status,
      serviceType: order.serviceType,
      weightKg: Number(order.weightKg),
      readyAt: asQueueDate(order.readyAt),
      pickupAt: asQueueDate(order.pickupAt),
      estimatedAt: asQueueDate(order.estimatedAt),
      groupCode: order.groupCode ?? null,
      currentStage: stageState.currentStage,
       nextStage: nextStageName,
       orderStageId: machineRequirement?.stage?.orderStageId ?? stageState.nextStage?.orderStageId ?? null,
       machineId: machineRequirement ? bestCandidate?.machineId ?? scheduledMachineId : null,
       machineName: machineRequirement ? bestCandidate?.machineName ?? scheduledMachine?.name ?? null : null,
       requiredMachineType: machineRequirement?.requiredMachineType ?? null,
      compatibleMachineIds: candidates.map((candidate) => candidate.machineId),
      plannedStartAt: asQueueDate(stageState.nextStage?.plannedStartAt),
       plannedEndAt: asQueueDate(stageState.nextStage?.plannedEndAt),
       ...taskTiming,
      ...risk,
      priorityReason: bestCandidate?.priorityReasons[0] ?? risk.riskMessage,
      priorityReasons: bestCandidate?.priorityReasons ?? [risk.riskMessage],
      nextAction: operationalState === "NEEDS_REVIEW"
        ? "Kiểm tra và đồng bộ trạng thái đơn với công đoạn đang chạy"
         : nextStageName
           ? `Chuẩn bị công đoạn ${nextStageName}`
          : order.status === "READY"
            ? "Kiểm tra thông tin trước khi thông báo khách"
            : "Kiểm tra trạng thái đơn",
      operationalState,
      reviewReasons: stageState.reviewReasons,
       canStart: operationalState === "NORMAL" && (machineRequirement ? candidates.length > 0 : true),
      recommendationBlockedReasons: operationalState === "NORMAL"
        ? []
        : stageState.reviewReasons,
      remainingStages: stageState.remainingStages,
      createdAt: asQueueDate(order.createdAt) ?? now,
    };
  });
  items.sort(compareSmartQueuePriority);
  const rankedItems = items.map((item, index) => ({ ...item, rank: index + 1 }));
  const byOrderId = new Map(rankedItems.map((item) => [item.orderId, item]));
  const recommendations = machineRecommendations
    .map((result) => {
      const candidate = result.recommendation;
      const item = candidate ? byOrderId.get(candidate.orderId) : null;
      return item && candidate
        ? {
            ...item,
            machineId: candidate.machineId,
            machineName: candidate.machineName,
            orderStageId: candidate.orderStageId,
            nextStage: candidate.stage,
            priorityReason: candidate.priorityReasons[0],
            priorityReasons: candidate.priorityReasons,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item, index, self) => index === self.findIndex((t) => t.orderId === item.orderId))
    .sort((left, right) => left.rank - right.rank || (left.machineId ?? 0) - (right.machineId ?? 0));

  const attentionItems = rankedItems.filter((item) =>
    item.operationalState === "NEEDS_REVIEW" ||
    ["NOT_FEASIBLE", "AT_RISK", "UNKNOWN"].includes(item.riskLevel)
  );
  const statusCounts = rankedItems.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
  return {
    generatedAt: now,
    recommendation: recommendations[0] ?? null,
    recommendations,
    machineRecommendations,
    items: rankedItems,
    attentionItems,
    summary: {
      totalOrders: rankedItems.length,
      lateOrders: rankedItems.filter((item) => item.riskLevel === "NOT_FEASIBLE").length,
      atRiskOrders: rankedItems.filter((item) => item.riskLevel === "AT_RISK").length,
      unknownDeadlineOrders: rankedItems.filter((item) => item.riskLevel === "UNKNOWN").length,
      needsReviewOrders: rankedItems.filter((item) => item.operationalState === "NEEDS_REVIEW").length,
      availableMachines: availableMachines.length,
      runningMachines: machines.filter((machine) => machine.status === "RUNNING").length,
      statusCounts,
    },
  };
}

export function recommend(
  orders: QueueOrder[],
  machines: QueueMachine[] = [],
  excluded: number[] = [],
) {
  return buildQueueSnapshot(orders, machines, excluded);
}
