import {
  checkDeadlineFeasibility,
  getWorkflowStages,
  requiredMachineType,
} from "./scheduling.service.js";

export const smartQueueRiskThresholdMinutes = 15;

export type DateValue = Date | string | null | undefined;

export type SmartQueueMachine = {
  machineId: number;
  name?: string;
  status: string;
  type: string;
  capacityKg: number;
  processingMinutes?: number;
};

export type SmartQueueStage = {
  orderStageId?: number;
  orderId?: number;
  machineId?: number | null;
  stage: string;
  status: string;
  plannedStartAt?: DateValue;
  plannedEndAt?: DateValue;
  actualStartedAt?: DateValue;
  actualEndedAt?: DateValue;
};

export type SmartQueueOrder = {
  orderId: number;
  status: string;
  serviceType: string;
  weightKg: number | string | { toString(): string };
  pickupAt?: DateValue;
  estimatedAt?: DateValue;
  readyAt?: DateValue;
  createdAt: DateValue;
  groupCode?: string | null;
  customer?: { name: string; phone: string } | null;
  stages?: SmartQueueStage[];
};

export type SmartQueueRisk = "FEASIBLE" | "AT_RISK" | "NOT_FEASIBLE" | "UNKNOWN";

export function asQueueDate(value: DateValue) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function evaluateQueueRisk(
  pickupValue: DateValue,
  estimatedValue: DateValue,
  now = new Date(),
) {
  const pickupAt = asQueueDate(pickupValue);
  const estimatedAt = asQueueDate(estimatedValue);
  const missingFields: string[] = [];
  if (!pickupAt) missingFields.push("Giờ hẹn lấy (pickupAt)");
  if (!estimatedAt) missingFields.push("Giờ hoàn thành dự kiến (estimatedAt)");

  if (!pickupAt || !estimatedAt) {
    return {
      riskLevel: "UNKNOWN" as SmartQueueRisk,
      riskRank: 0,
      slackMinutes: null,
      minutesToPickup: pickupAt
        ? Math.floor((pickupAt.getTime() - now.getTime()) / 60_000)
        : null,
      missingFields,
      riskMessage: `Thiếu ${missingFields.join(" và ")}`,
    };
  }

  const feasibility = checkDeadlineFeasibility(
    estimatedAt,
    pickupAt,
    smartQueueRiskThresholdMinutes,
  );
  const riskLevel = feasibility.result as SmartQueueRisk;
  const riskRank = riskLevel === "NOT_FEASIBLE" ? 2 : riskLevel === "AT_RISK" ? 1 : 0;
  const slackMinutes = feasibility.slackMinutes;
  return {
    riskLevel,
    riskRank,
    slackMinutes,
    minutesToPickup: Math.floor((pickupAt.getTime() - now.getTime()) / 60_000),
    missingFields,
    riskMessage: riskLevel === "NOT_FEASIBLE"
      ? `Dự kiến trễ ${Math.abs(slackMinutes ?? 0)} phút`
      : riskLevel === "AT_RISK"
        ? `Chỉ còn ${slackMinutes ?? 0} phút dự phòng`
        : `Còn ${slackMinutes ?? 0} phút dự phòng`,
  };
}

export function getRequiredMachineStage(order: SmartQueueOrder) {
  let workflow: string[];
  try {
    workflow = getWorkflowStages(order.serviceType);
  } catch {
    return {
      stageName: null,
      stage: null,
      requiredMachineType: null,
      previousStagesCompleted: false,
      missingPreviousStages: [] as string[],
    };
  }

  const stages = order.stages ?? [];
  const stageName = workflow.find((name) => {
    if (!requiredMachineType(name)) return false;
    return stages.find((stage) => stage.stage === name)?.status !== "COMPLETED";
  }) ?? null;
  if (!stageName) {
    return {
      stageName: null,
      stage: null,
      requiredMachineType: null,
      previousStagesCompleted: true,
      missingPreviousStages: [] as string[],
    };
  }

  const stageIndex = workflow.indexOf(stageName);
  const missingPreviousStages = workflow.slice(0, stageIndex).filter(
    (name) => stages.find((stage) => stage.stage === name)?.status !== "COMPLETED",
  );
  return {
    stageName,
    stage: stages.find((stage) => stage.stage === stageName) ?? null,
    requiredMachineType: requiredMachineType(stageName),
    previousStagesCompleted: missingPreviousStages.length === 0,
    missingPreviousStages,
  };
}

export function getCandidateBlockReasons(
  order: SmartQueueOrder,
  machine: SmartQueueMachine,
) {
  const requirement = getRequiredMachineStage(order);
  const reasons: string[] = [];
  if (machine.status !== "AVAILABLE") reasons.push("Máy không còn ở trạng thái AVAILABLE");
  if (order.status !== "WAITING") reasons.push("Đơn không ở trạng thái WAITING");
  if (!requirement.stageName || !requirement.requiredMachineType)
    reasons.push("Đơn không còn công đoạn máy cần xử lý");
  if (requirement.requiredMachineType && requirement.requiredMachineType !== machine.type)
    reasons.push(`Đơn cần ${requirement.requiredMachineType}, không phù hợp với ${machine.type}`);
  if (Number(order.weightKg) > machine.capacityKg)
    reasons.push("Khối lượng đơn vượt sức chứa máy");
  if ((order.stages ?? []).some((stage) => stage.status === "RUNNING"))
    reasons.push("Đơn đang có công đoạn RUNNING");
  if (!requirement.stage || requirement.stage.status !== "PLANNED")
    reasons.push("Công đoạn máy tiếp theo chưa ở trạng thái PLANNED");
  if (!requirement.previousStagesCompleted)
    reasons.push(`Công đoạn trước chưa hoàn tất: ${requirement.missingPreviousStages.join(", ")}`);
  return [...new Set(reasons)];
}

function compareNullableNumber(left: number | null, right: number | null) {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return left - right;
}

function compareNullableDate(left: DateValue, right: DateValue) {
  const leftTime = asQueueDate(left)?.getTime() ?? null;
  const rightTime = asQueueDate(right)?.getTime() ?? null;
  return compareNullableNumber(leftTime, rightTime);
}

export function compareSmartQueuePriority(
  left: {
    riskRank: number;
    slackMinutes: number | null;
    pickupAt: DateValue;
    createdAt: DateValue;
    orderId: number;
  },
  right: {
    riskRank: number;
    slackMinutes: number | null;
    pickupAt: DateValue;
    createdAt: DateValue;
    orderId: number;
  },
) {
  return right.riskRank - left.riskRank ||
    compareNullableNumber(left.slackMinutes, right.slackMinutes) ||
    compareNullableDate(left.pickupAt, right.pickupAt) ||
    compareNullableDate(left.createdAt, right.createdAt) ||
    left.orderId - right.orderId;
}

export function buildRecommendationReasons(
  risk: ReturnType<typeof evaluateQueueRisk>,
  machine: SmartQueueMachine,
) {
  const reasons: string[] = [];
  if (risk.riskLevel === "NOT_FEASIBLE") reasons.push("Đơn đã vượt giờ hẹn");
  else if (risk.riskLevel === "AT_RISK") reasons.push("Đơn sắp đến giờ hẹn");
  else if (risk.riskLevel === "UNKNOWN")
    reasons.push("Chưa đủ dữ liệu để đánh giá nguy cơ trễ");

  if (risk.minutesToPickup !== null) {
    reasons.push(
      risk.minutesToPickup < 0
        ? `Đã quá giờ hẹn ${Math.abs(risk.minutesToPickup)} phút`
        : `Còn ${risk.minutesToPickup} phút đến giờ hẹn`,
    );
  }
  reasons.push(`${machine.name ?? `Máy ${machine.machineId}`} phù hợp`);
  return reasons.slice(0, 3);
}

export function buildMachineRecommendation(
  orders: SmartQueueOrder[],
  machine: SmartQueueMachine,
  now = new Date(),
) {
  const candidates = orders
    .filter((order) => getCandidateBlockReasons(order, machine).length === 0)
    .map((order) => {
      const requirement = getRequiredMachineStage(order);
      const risk = evaluateQueueRisk(order.pickupAt, order.estimatedAt, now);
      return {
        orderId: order.orderId,
        orderStageId: requirement.stage?.orderStageId ?? null,
        stage: requirement.stageName,
        requiredMachineType: requirement.requiredMachineType,
        machineId: machine.machineId,
        machineName: machine.name ?? `Máy ${machine.machineId}`,
        customer: order.customer ?? null,
        serviceType: order.serviceType,
        weightKg: Number(order.weightKg),
        pickupAt: asQueueDate(order.pickupAt),
        estimatedAt: asQueueDate(order.estimatedAt),
        createdAt: asQueueDate(order.createdAt),
        ...risk,
        priorityReasons: buildRecommendationReasons(risk, machine),
      };
    })
    .sort(compareSmartQueuePriority)
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));

  return {
    generatedAt: now,
    machine: {
      machineId: machine.machineId,
      name: machine.name ?? `Máy ${machine.machineId}`,
      status: machine.status,
      type: machine.type,
      capacityKg: machine.capacityKg,
      processingMinutes: machine.processingMinutes ?? null,
    },
    recommendation: candidates[0] ?? null,
    candidates,
    emptyMessage: candidates.length === 0
      ? "Hiện chưa có đơn phù hợp cho máy này."
      : null,
  };
}
