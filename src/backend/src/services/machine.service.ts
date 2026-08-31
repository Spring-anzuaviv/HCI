import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { findOrderForStore, refreshStoreSchedule } from "./order.service.js";
import { requiredMachineType } from "./scheduling.service.js";

export async function list(storeId: number) {
  const machines = await prisma.machine.findMany({
    where: { storeId },
    include: {
      stages: {
        where: { status: { not: "COMPLETED" } },
        include: { order: true },
        orderBy: { actualStartedAt: "desc" },
      },
    },
  });
  return machines.map((machine) => {
    const current = machine.stages.find((stage) => stage.status === "RUNNING") ?? machine.stages[0];
    const elapsed = current?.actualStartedAt
      ? Math.floor((Date.now() - current.actualStartedAt.getTime()) / 60000)
      : 0;
    return {
      ...machine,
      timeLeft: current ? Math.max(0, machine.processingMinutes - elapsed) : 0,
      locked: machine.stages.length > 0,
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

export async function startRun(orderId: number, storeId: number, input: any) {
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

export async function completeRun(orderStageId: number, storeId: number, endedAt?: string) {
  const stage = await prisma.orderStage.findFirst({
    where: { orderStageId, order: { storeId } },
    include: { order: true, machine: true },
  });
  if (!stage) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy stage máy");
  if (stage.status !== "RUNNING")
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Stage máy chưa ở trạng thái đang chạy");
  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.orderStage.update({
      where: { orderStageId },
      data: {
        actualEndedAt: endedAt ? new Date(endedAt) : new Date(),
        status: "COMPLETED",
      },
    });
    const nextStatus = stage.stage === "PACKING"
      ? "READY"
      : stage.stage === "SORTING" || stage.stage === "TRANSFER"
        ? "WAITING"
        : stage.stage === "WASH" && stage.order.serviceType === "WASH_DRY"
          ? "WAITING"
          : "FOLDING_PACKING";
    await tx.laundryOrder.update({
      where: { orderId: stage.orderId },
      data: { status: nextStatus },
    });
    if (stage.machineId)
      await tx.machine.update({
        where: { machineId: stage.machineId },
        data: { status: "AVAILABLE" },
      });
    return result;
  });
  await refreshStoreSchedule(storeId);
  return result;
}
