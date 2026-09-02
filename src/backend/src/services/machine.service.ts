import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { formatDurationLabel } from "../utils/timeFormat.js";
import {
  findOrderForStore,
  findStoreOrders,
  refreshStoreSchedule,
} from "./order.service.js";
import { buildQueueSnapshot } from "./queue.service.js";
import { getWorkflowStages, requiredMachineType } from "./scheduling.service.js";
import {
  calculateCompletionTiming,
  canReleaseMachine,
  expectedOrderStatusForRunningStage,
  nextOrderStatusAfterStage,
} from "./machine-workflow.js";

export function calculateTimeLeft(
  processingMinutes: number,
  actualStartedAt: Date | null | undefined,
  now = new Date(),
) {
  return calculateCompletionTiming(processingMinutes, actualStartedAt, now)
    .timeLeft;
}

export async function list(storeId: number) {
  const now = new Date();
  const machines = await prisma.machine.findMany({
    where: { storeId },
    include: {
      stages: {
        where: { status: { in: ["RUNNING", "PLANNED"] } },
        include: { order: { include: { customer: true } } },
        orderBy: [{ plannedStartAt: "asc" }, { orderStageId: "asc" }],
      },
    },
    orderBy: { machineId: "asc" },
  });
  return machines.map((machine) => {
    const runningStages = machine.stages.filter((stage) => stage.status === "RUNNING");
    const current = runningStages
      .sort((left, right) =>
        (right.actualStartedAt?.getTime() ?? 0) - (left.actualStartedAt?.getTime() ?? 0),
      )[0] ?? null;
    const nextPlannedStage = machine.stages
      .filter((stage) => stage.status === "PLANNED")
      .sort((left, right) =>
        (left.plannedStartAt?.getTime() ?? Number.POSITIVE_INFINITY) -
          (right.plannedStartAt?.getTime() ?? Number.POSITIVE_INFINITY) ||
        left.orderStageId - right.orderStageId,
      )[0] ?? null;
    const reviewReasons: string[] = [];
    if (runningStages.length > 1) reviewReasons.push("Máy có nhiều công đoạn RUNNING");
    if (machine.status === "RUNNING" && !current)
      reviewReasons.push("Máy báo RUNNING nhưng không có công đoạn đang chạy");
    if (machine.status === "AVAILABLE" && current)
      reviewReasons.push("Máy báo AVAILABLE nhưng vẫn có công đoạn đang chạy");
    if (["BROKEN", "INACTIVE"].includes(machine.status) && current)
      reviewReasons.push("Máy đã ngừng hoạt động nhưng vẫn có công đoạn RUNNING");
    if (current && !current.actualStartedAt)
      reviewReasons.push("Công đoạn RUNNING thiếu actualStartedAt");
    const expectedOrderStatus = current
      ? expectedOrderStatusForRunningStage(current.stage)
      : null;
    if (
      current &&
      (!expectedOrderStatus || current.order.status !== expectedOrderStatus)
    ) {
      reviewReasons.push(
        `Công đoạn ${current.stage} đang RUNNING nhưng trạng thái đơn là ${current.order.status}`,
      );
    }
    const timing = calculateCompletionTiming(
      machine.processingMinutes,
      current?.actualStartedAt,
      now,
    );
    const completionBlockedReasons = current
      ? [
          ...(runningStages.length > 1
            ? ["Máy có nhiều công đoạn RUNNING"]
            : []),
          ...(!["WASH", "DRY"].includes(current.stage)
            ? [`Công đoạn ${current.stage} không phải công đoạn máy`]
            : []),
          ...(machine.status !== "RUNNING"
            ? [`Máy đang ở trạng thái ${machine.status}, không phải RUNNING`]
            : []),
          ...(!current.actualStartedAt
            ? ["Công đoạn RUNNING thiếu thời gian bắt đầu thực tế"]
            : []),
          ...(!expectedOrderStatus || current.order.status !== expectedOrderStatus
            ? ["Trạng thái đơn và công đoạn đang chạy chưa đồng bộ"]
            : []),
        ]
      : [];
    return {
      ...machine,
      currentStage: current,
      nextPlannedStage,
      finishAt: timing.finishAt,
      timeLeft: timing.timeLeft,
      completionDue: Boolean(current && timing.completionDue),
      completionActionAllowed:
        Boolean(current && timing.completionDue) &&
        completionBlockedReasons.length === 0,
      completionBlockedReason: completionBlockedReasons[0] ?? null,
      locked: machine.stages.length > 0,
      operationalState: reviewReasons.length > 0 ? "NEEDS_REVIEW" : "NORMAL",
      reviewReasons,
    };
  });
}

export async function detail(machineId: number, storeId: number) {
  const machine = await prisma.machine.findFirst({
    where: { machineId, storeId },
    include: {
      stages: {
        orderBy: { plannedStartAt: "desc" },
        take: 1,
        include: { order: true },
      },
    },
  });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  return machine;
}

const machineInput = (input: any) => ({ name: String(input.name).trim(), type: String(input.type).toUpperCase(), capacityKg: Number(input.capacityKg), processingMinutes: Number(input.processingMinutes), status: String(input.status ?? "AVAILABLE").toUpperCase() });
function validateMachine(input: any) {
  const data = machineInput(input);
  if (!data.name || !["WASHER", "DRYER"].includes(data.type) || data.capacityKg <= 0 || data.processingMinutes <= 0 || !["AVAILABLE", "RUNNING", "BROKEN", "INACTIVE"].includes(data.status)) throw new ApiError(400, "VALIDATION_ERROR", "Thông tin máy không hợp lệ");
  return data;
}
export async function create(storeId: number, input: any) {
  const result = await prisma.machine.create({ data: { storeId, ...validateMachine(input) } });
  await refreshStoreSchedule(storeId);
  return result;
}
export async function update(machineId: number, storeId: number, input: any) {
  const machine = await prisma.machine.findFirst({ where: { machineId, storeId }, include: { stages: { where: { status: { not: "COMPLETED" } }, select: { status: true } } } });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  const data = validateMachine({ ...machine, ...input });
  if (machine.stages.length > 0 && (data.name !== machine.name || data.type !== machine.type || data.capacityKg !== Number(machine.capacityKg) || data.processingMinutes !== machine.processingMinutes))
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Máy đang gắn với order chưa hoàn thành; chỉ được cập nhật trạng thái");
  if (machine.status === "RUNNING" && !["RUNNING", "BROKEN"].includes(data.status)) throw new ApiError(409, "WORKFLOW_CONFLICT", "Máy đang chạy chỉ có thể chuyển sang trạng thái Hỏng");
  if (machine.stages.some((stage) => stage.status === "RUNNING") && data.status === "AVAILABLE") throw new ApiError(409, "WORKFLOW_CONFLICT", "Không thể chuyển máy sang Sẵn sàng khi order vẫn đang chạy");
  const result = await prisma.machine.update({ where: { machineId }, data });
  await refreshStoreSchedule(storeId);
  return result;
}
export async function remove(machineId: number, storeId: number) {
  const machine = await prisma.machine.findFirst({ where: { machineId, storeId }, include: { stages: { where: { status: { in: ["RUNNING", "PLANNED"] } } } } });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  if (machine.stages.length) throw new ApiError(409, "WORKFLOW_CONFLICT", "Không thể xóa máy đang có lịch xử lý");
  await prisma.machine.delete({ where: { machineId } });
  await refreshStoreSchedule(storeId);
  return { deleted: true };
}

async function legacyStartRun(orderId: number, storeId: number, input: any) {
  const order = await findOrderForStore(orderId, storeId);
  const stageName = String(input.stage);
  const stage = order.stages.find((item: any) => item.stage === stageName);
  if (!stage || stage.status !== "PLANNED")
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Stage không còn sẵn sàng để bắt đầu");
  const machineType = requiredMachineType(stageName);
  if (!machineType) {
    const result = await prisma.orderStage.update({
      where: { orderStageId: stage.orderStageId },
      data: {
        actualStartedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
        status: "RUNNING",
      },
    });
    await prisma.laundryOrder.update({
      where: { orderId },
      data: { status: stageName === "SORTING" ? "RECEIVED" : "FOLDING_PACKING" },
    });
    await refreshStoreSchedule(storeId);
    return result;
  }
  const machine = await prisma.machine.findFirst({
    where: { machineId: Number(input.machineId), storeId },
  });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  if (machine.type !== machineType)
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Loại máy không phù hợp với stage");
  if (Number(order.weightKg) > machine.capacityKg)
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Khối lượng vượt sức chứa máy");
  if (machine.status !== "AVAILABLE")
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Máy không khả dụng");
  if (
    await prisma.orderStage.findFirst({
      where: { machineId: machine.machineId, status: "RUNNING" },
    })
  )
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Máy đang có mẻ chưa hoàn tất");
  if (
    await prisma.orderStage.findFirst({
      where: { orderId, status: "RUNNING" },
    })
  )
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Đơn đang có stage khác chạy");
  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.orderStage.update({
      where: { orderStageId: stage.orderStageId },
      data: {
        machineId: machine.machineId,
        actualStartedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
        status: "RUNNING",
      },
    });
    await tx.laundryOrder.update({
      where: { orderId },
      data: { status: stageName === "WASH" ? "WASHING" : "DRYING" },
    });
    await tx.machine.update({
      where: { machineId: machine.machineId },
      data: { status: "RUNNING" },
    });
    return result;
  });
  await refreshStoreSchedule(storeId);
  return result;
}

void legacyStartRun;

export async function startRun(orderId: number, storeId: number, input: any) {
  const stageName = String(input.stage ?? "").trim().toUpperCase();
  if (!stageName)
    throw new ApiError(400, "VALIDATION_ERROR", "Thiếu công đoạn cần bắt đầu");
  const machineId = Number(input.machineId);
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.laundryOrder.findFirst({
      where: { orderId, storeId },
      include: { stages: true },
    });
    if (!order) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng");
    const stage = order.stages.find((item) => item.stage === stageName);
    if (!stage || stage.status !== "PLANNED")
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Công đoạn không còn sẵn sàng để bắt đầu");

    const workflow = getWorkflowStages(order.serviceType);
    const stageIndex = workflow.indexOf(stageName);
    if (stageIndex < 0)
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Công đoạn không thuộc workflow của dịch vụ");
    const incompletePrevious = workflow.slice(0, stageIndex).filter(
      (name) => order.stages.find((item) => item.stage === name)?.status !== "COMPLETED",
    );
    if (incompletePrevious.length > 0)
      throw new ApiError(
        409,
        "WORKFLOW_CONFLICT",
        `Công đoạn trước chưa hoàn tất: ${incompletePrevious.join(", ")}`,
      );

    const machineType = requiredMachineType(stageName);
    if (!machineType) {
      const manualStatus: Record<string, string> = {
        SORTING: "RECEIVED",
        TRANSFER: "WAITING",
        PACKING: "FOLDING_PACKING",
      };
      const nextOrderStatus = manualStatus[stageName];
      if (!nextOrderStatus)
        throw new ApiError(409, "WORKFLOW_CONFLICT", "Không xác định được trạng thái công đoạn");
        
      let manualDuration = 0;
      if (stageName === "SORTING" || stageName === "PACKING") manualDuration = 5;
      else if (stageName === "TRANSFER") manualDuration = 2;
      const plannedEndAt = new Date(now.getTime() + manualDuration * 60_000);

      const updated = await tx.orderStage.updateMany({
        where: { orderStageId: stage.orderStageId, status: "PLANNED" },
        data: { actualStartedAt: now, plannedEndAt, status: "RUNNING" },
      });
      if (updated.count !== 1)
        throw new ApiError(409, "WORKFLOW_CONFLICT", "Dữ liệu công đoạn đã thay đổi, vui lòng tải lại");
      await tx.laundryOrder.update({ where: { orderId }, data: { status: nextOrderStatus } });
      return tx.orderStage.findUniqueOrThrow({ where: { orderStageId: stage.orderStageId } });
    }

    if (!Number.isInteger(machineId) || machineId <= 0)
      throw new ApiError(400, "VALIDATION_ERROR", "Thiếu máy cần bắt đầu");
    if (order.status !== "WAITING")
      throw new ApiError(
        409,
        "WORKFLOW_CONFLICT",
        `Đơn đang ở trạng thái "${order.status}" — cần hoàn tất công đoạn trước (${incompletePrevious.join(", ") || "kiểm tra lại thứ tự"}) trước khi bắt đầu ${stageName}`,
      );
    const machine = await tx.machine.findFirst({ where: { machineId, storeId } });
    if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
    if (machine.type !== machineType)
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Loại máy không phù hợp với công đoạn");
    if (Number(order.weightKg) > machine.capacityKg)
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Khối lượng đơn vượt sức chứa máy");
    if (machine.status !== "AVAILABLE")
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Máy không còn ở trạng thái AVAILABLE");
    if (await tx.orderStage.findFirst({ where: { machineId, status: "RUNNING" } }))
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Máy đang có mẻ chưa hoàn tất");
    if (await tx.orderStage.findFirst({ where: { orderId, status: "RUNNING" } }))
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Đơn đang có công đoạn khác RUNNING");

    const plannedEndAt = new Date(now.getTime() + machine.processingMinutes * 60_000);
    const updatedStage = await tx.orderStage.updateMany({
      where: { orderStageId: stage.orderStageId, status: "PLANNED" },
      data: { machineId, actualStartedAt: now, plannedEndAt, status: "RUNNING" },
    });
    const updatedOrder = await tx.laundryOrder.updateMany({
      where: { orderId, storeId, status: "WAITING" },
      data: { status: stageName === "WASH" ? "WASHING" : "DRYING" },
    });
    const updatedMachine = await tx.machine.updateMany({
      where: { machineId, storeId, status: "AVAILABLE" },
      data: { status: "RUNNING" },
    });
    if (updatedStage.count !== 1 || updatedOrder.count !== 1 || updatedMachine.count !== 1)
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Dữ liệu vận hành đã thay đổi, vui lòng tải lại");
    return tx.orderStage.findUniqueOrThrow({
      where: { orderStageId: stage.orderStageId },
      include: { order: true, machine: true },
    });
  }, { isolationLevel: "Serializable" });
  await refreshStoreSchedule(storeId);
  return result;
}

export async function completeRun(orderStageId: number, storeId: number) {
  const now = new Date();
  const stage = await prisma.orderStage.findUnique({
    where: { orderStageId },
    include: { machine: true },
  });
  if (!stage) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy stage máy");
  const order = await prisma.laundryOrder.findUnique({
    where: { orderId: stage.orderId },
  });
  if (!order)
    throw new ApiError(
      409,
      "SYNC_ERROR",
      "Không tìm thấy đơn hàng của công đoạn đang chạy",
    );
  if (order.storeId !== storeId)
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy stage máy");
  if (stage.status !== "RUNNING")
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Stage máy chưa ở trạng thái đang chạy");
  const expectedOrderStatus = expectedOrderStatusForRunningStage(stage.stage);
  if (!expectedOrderStatus || order.status !== expectedOrderStatus)
    throw new ApiError(
      409,
      "SYNC_ERROR",
      `Trạng thái đơn ${order.status} không khớp với công đoạn ${stage.stage} đang RUNNING`,
    );

  const machineType = requiredMachineType(stage.stage);
  if (machineType) {
    if (!stage.machine || !stage.actualStartedAt)
      throw new ApiError(
        409,
        "SYNC_ERROR",
        "Công đoạn máy đang chạy thiếu máy hoặc thời gian bắt đầu",
      );
    if (!["RUNNING", "BROKEN", "INACTIVE"].includes(stage.machine.status))
      throw new ApiError(
        409,
        "SYNC_ERROR",
        `Máy đang ở trạng thái ${stage.machine.status} nhưng công đoạn vẫn RUNNING`,
      );
    const timing = calculateCompletionTiming(
      stage.machine.processingMinutes,
      stage.actualStartedAt,
      now,
    );
    if (!timing.completionDue)
      throw new ApiError(
        409,
        "MACHINE_NOT_FINISHED",
        `Máy chưa hoàn tất, còn khoảng ${formatDurationLabel(timing.timeLeft ?? 0)}`,
      );
  }

  const nextStatus = nextOrderStatusAfterStage(
    stage.stage,
    order.serviceType,
  );
  if (!nextStatus)
    throw new ApiError(
      409,
      "WORKFLOW_CONFLICT",
      `Không xác định được trạng thái sau công đoạn ${stage.stage}`,
    );

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.orderStage.updateMany({
      where: { orderStageId, status: "RUNNING" },
      data: { actualEndedAt: now, status: "COMPLETED" },
    });
    if (updated.count !== 1)
      throw new ApiError(
        409,
        "WORKFLOW_CONFLICT",
        "Công đoạn đã được xử lý bởi một phiên làm việc khác",
      );
    const updatedOrder = await tx.laundryOrder.updateMany({
      where: { orderId: stage.orderId, status: expectedOrderStatus },
      data: { status: nextStatus },
    });
    if (updatedOrder.count !== 1)
      throw new ApiError(
        409,
        "SYNC_ERROR",
        "Trạng thái đơn đã thay đổi trong lúc hoàn tất công đoạn",
      );
    if (stage.machineId && stage.machine && canReleaseMachine(stage.machine.status))
      await tx.machine.updateMany({
        where: {
          machineId: stage.machineId,
          status: { notIn: ["BROKEN", "INACTIVE"] },
        },
        data: { status: "AVAILABLE" },
      });
    return tx.orderStage.findUniqueOrThrow({
      where: { orderStageId },
      include: { order: true, machine: true },
    });
  });
  await refreshStoreSchedule(storeId);
  const [orders, machines, updatedMachine] = await Promise.all([
    findStoreOrders(storeId),
    prisma.machine.findMany({ where: { storeId } }),
    stage.machineId
      ? prisma.machine.findFirst({ where: { machineId: stage.machineId, storeId } })
      : Promise.resolve(null),
  ]);
  const queue = buildQueueSnapshot(orders, machines, [], now);
  const recommendation = stage.machineId
    ? queue.recommendations.find((item) => item.machineId === stage.machineId) ?? null
    : queue.recommendation;
  return {
    completedStage: result,
    orderStatus: nextStatus,
    machine: updatedMachine,
    recommendation,
  };
}

export async function markOutOfService(
  machineId: number,
  storeId: number,
  status: string,
) {
  if (!["BROKEN", "INACTIVE"].includes(status))
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Trạng thái máy chỉ có thể là BROKEN hoặc INACTIVE",
    );
  const machine = await prisma.machine.findFirst({
    where: { machineId, storeId },
  });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");

  const updated = await prisma.machine.update({
    where: { machineId },
    data: { status },
  });
  await refreshStoreSchedule(storeId);
  return updated;
}

/**
 * Đặt lại máy về AVAILABLE khi máy kẹt NEEDS_REVIEW
 * (status = RUNNING nhưng không còn OrderStage nào RUNNING gắn với máy).
 * Chỉ cho phép nếu KHÔNG có stage RUNNING thực sự, để tránh mất dữ liệu.
 */
export async function resetToAvailable(machineId: number, storeId: number) {
  const machine = await prisma.machine.findFirst({
    where: { machineId, storeId },
    include: {
      stages: { where: { status: "RUNNING" } },
    },
  });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");

  // Nếu CÓ stage RUNNING thực sự → không cho reset, phải hoàn tất mẻ đó trước
  if (machine.stages.length > 0) {
    throw new ApiError(
      409,
      "WORKFLOW_CONFLICT",
      `Máy đang có mẻ ${machine.stages[0].stage} RUNNING (đơn #${machine.stages[0].orderId}). Hoàn tất mẻ này trước khi đặt lại.`,
    );
  }

  const updated = await prisma.machine.update({
    where: { machineId },
    data: { status: "AVAILABLE" },
  });
  await refreshStoreSchedule(storeId);
  return updated;
}
