import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import {
  getWorkflowStages,
  checkDeadlineFeasibility,
  generateSchedule,
  isStageOverdue,
  findEarliestAvailableSlot,
  requiredMachineType,
  getStageDuration,
  calculateETA,
} from "./scheduling.service.js";

export const stages = [
  "RECEIVED",
  "WAITING",
  "WASHING",
  "DRYING",
  "FOLDING_PACKING",
  "READY",
  "NOTIFIED",
  "COMPLETED",
] as const;
export const activeStatuses = new Set([
  "RECEIVED",
  "WAITING",
  "WASHING",
  "DRYING",
  "FOLDING_PACKING",
]);
export const orderInclude = {
  customer: true,
  stages: {
    include: { machine: true },
    orderBy: { plannedStartAt: "asc" as const },
  },
};
export const getNextAction = (status: string) =>
  (
    ({
      RECEIVED: "Phân loại đồ",
      WAITING: "Chọn máy phù hợp",
      WASHING: "Theo dõi mẻ giặt",
      DRYING: "Theo dõi mẻ sấy",
      FOLDING_PACKING: "Gấp và đóng gói",
      READY: "Gửi thông báo khách",
      NOTIFIED: "Bàn giao đơn",
      COMPLETED: "Đã hoàn tất",
    }) as Record<string, string>
  )[status] ?? "Kiểm tra đơn";
export function riskLevel(order: any) {
  if (!activeStatuses.has(order.status)) return "LOW";
  const result = checkDeadlineFeasibility(order.estimatedAt, order.pickupAt);
  return result.result === "NOT_FEASIBLE"
    ? "HIGH"
    : result.result === "AT_RISK"
      ? "MEDIUM"
      : "LOW";
}
export function serializeOrder(order: any) {
  const risk = riskLevel(order);
  const current = order.stages?.find((stage: any) => stage.status === "RUNNING");
  const next = order.stages?.find((stage: any) => stage.status !== "COMPLETED");
  return {
    ...order,
    weightKg: Number(order.weightKg),
    riskLevel: risk,
    currentStage: current?.stage ?? next?.stage ?? order.status,
    currentMachine: current?.machine ?? null,
    nextAction: getNextAction(order.status),
    priorityReason:
      risk === "HIGH" ? "Đã vượt giờ hẹn" : risk === "MEDIUM" ? "Sắp đến giờ hẹn" : "Theo schedule hiện tại",
  };
}
export function serializeOrders(orders: any[]) {
  const groupEta = new Map<string, Date>();
  for (const order of orders) {
    if (!order.groupCode || !order.estimatedAt) continue;
    const current = groupEta.get(order.groupCode);
    if (!current || order.estimatedAt > current) groupEta.set(order.groupCode, order.estimatedAt);
  }
  return orders.map(order => ({
    ...serializeOrder(order),
    groupETA: order.groupCode ? groupEta.get(order.groupCode) ?? order.estimatedAt : order.estimatedAt,
  }));
}
export async function findOrderForStore(orderId: number, storeId: number) {
  const order = await prisma.laundryOrder.findFirst({
    where: { orderId, storeId },
    include: orderInclude,
  });
  if (!order)
    throw new ApiError(
      404,
      "NOT_FOUND",
      "Không tìm thấy đơn hàng trong cửa hàng",
    );
  return order;
}
export async function findSerializedOrderForStore(orderId: number, storeId: number) {
  const order = await findOrderForStore(orderId, storeId);
  if (!order.groupCode) {
    return { ...serializeOrder(order), groupETA: order.estimatedAt };
  }
  const group = await prisma.laundryOrder.aggregate({
    where: { storeId, groupCode: order.groupCode },
    _max: { estimatedAt: true },
  });
  return {
    ...serializeOrder(order),
    groupETA: group._max.estimatedAt ?? order.estimatedAt,
  };
}
export async function findStoreOrders(storeId: number) {
  return prisma.laundryOrder.findMany({
    where: { storeId },
    include: orderInclude,
  });
}
export async function createOrders(storeId: number, inputs: any[]) {
  if (inputs.length === 0)
    throw new ApiError(400, "VALIDATION_ERROR", "Danh sách đơn không được để trống");
  inputs.forEach((input) => getWorkflowStages(input.serviceType));

  // Ghi toàn bộ mẻ trong một transaction, sau đó chỉ tính schedule một lần.
  const orderIds = await prisma.$transaction(async (tx) => {
    const createdIds: number[] = [];
    for (const input of inputs) {
      const customer = await tx.customer.upsert({
        where: { phone: input.customer.phone },
        update: { name: input.customer.name },
        create: { name: input.customer.name, phone: input.customer.phone },
      });
      const created = await tx.laundryOrder.create({
        data: {
          customerId: customer.customerId,
          storeId,
          weightKg: Number(input.weightKg),
          serviceType: input.serviceType,
          status: "RECEIVED",
          readyAt: input.readyAt ? new Date(input.readyAt) : new Date(),
          pickupAt: input.pickupAt ? new Date(input.pickupAt) : null,
          groupCode: input.groupCode ?? null,
          stages: {
            create: getWorkflowStages(input.serviceType).map((stage) => ({
              stage,
              machineId: null,
              status: "PLANNED",
            })),
          },
        },
        select: { orderId: true },
      });
      createdIds.push(created.orderId);
    }
    return createdIds;
  });

  await refreshStoreSchedule(storeId);
  return prisma.laundryOrder.findMany({
    where: { storeId, orderId: { in: orderIds } },
    include: orderInclude,
    orderBy: { orderId: "asc" },
  });
}

export async function createOrder(storeId: number, input: any) {
  const [created] = await createOrders(storeId, [input]);
  return created;
}

type RefreshScheduleOptions = {
  preserveOverdue?: boolean;
  onlyIfOverdueFeasible?: boolean;
};

export async function refreshStoreSchedule(
  storeId: number,
  options: RefreshScheduleOptions = { preserveOverdue: true },
  now = new Date(),
) {
  const [orders, machines] = await Promise.all([
    prisma.laundryOrder.findMany({
      where: { storeId },
      include: { stages: { include: { machine: true } } },
    }),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  const originalStageById = new Map(
    orders.flatMap((order) => order.stages.map((stage) => [stage.orderStageId, stage] as const)),
  );
  const originalOrderById = new Map(orders.map((order) => [order.orderId, order]));
  const preserveOverdue = options.preserveOverdue ?? true;
  const overdueOrderIds = new Set(
    orders
      .filter((order) => order.stages.some((stage) => isStageOverdue(stage, now)))
      .map((order) => order.orderId),
  );
  const schedule = generateSchedule(orders, machines, now, { preserveOverdue });
  if (options.onlyIfOverdueFeasible && overdueOrderIds.size > 0) {
    const groupEta = new Map<string, Date>();
    for (const item of schedule) {
      const order = orders.find((candidate) => candidate.orderId === item.orderId);
      if (order?.groupCode) {
        const current = groupEta.get(order.groupCode);
        if (!current || item.estimatedAt > current) groupEta.set(order.groupCode, item.estimatedAt);
      }
    }
    const scheduleById = new Map(schedule.map((item) => [item.orderId, item]));
    const overdueCanBeRecovered = [...overdueOrderIds].every((orderId) => {
      const order = originalOrderById.get(orderId);
      const item = scheduleById.get(orderId);
      const estimatedAt = order?.groupCode ? groupEta.get(order.groupCode) : item?.estimatedAt;
      return Boolean(order && estimatedAt && checkDeadlineFeasibility(estimatedAt, order.pickupAt).result === "FEASIBLE");
    });
    const noNewLateDeadline = orders.every((order) => {
      if (overdueOrderIds.has(order.orderId)) return true;
      const item = scheduleById.get(order.orderId);
      const current = checkDeadlineFeasibility(order.estimatedAt, order.pickupAt).result;
      const proposed = checkDeadlineFeasibility(item?.estimatedAt ?? null, order.pickupAt).result;
      return current === "NOT_FEASIBLE" || proposed !== "NOT_FEASIBLE";
    });
    if (!overdueCanBeRecovered || !noNewLateDeadline) return schedule;
  }
  // Batch tất cả writes thành 1 transaction với Promise.all thay vì await tuần tự.
  // Điều này giảm đáng kể thời gian chờ khi có nhiều đơn và công đoạn.
  return prisma.$transaction(async (tx) => {
    const stageUpdates: Promise<unknown>[] = [];
    const orderUpdates: Promise<unknown>[] = [];

    for (const item of schedule) {
      for (const stage of item.stages) {
        if (stage.status !== "PLANNED") continue;
        const original = originalStageById.get(stage.orderStageId);
        const sameDate = (left: Date | null, right: Date | null) =>
          left?.getTime() === right?.getTime();
        if (
          original &&
          original.machineId === stage.machineId &&
          sameDate(original.plannedStartAt, stage.plannedStartAt) &&
          sameDate(original.plannedEndAt, stage.plannedEndAt)
        ) continue;
        stageUpdates.push(
          tx.orderStage.update({
            where: { orderStageId: stage.orderStageId },
            data: {
              machineId: stage.machineId,
              plannedStartAt: stage.plannedStartAt,
              plannedEndAt: stage.plannedEndAt,
            },
          })
        );
      }
      const originalOrder = originalOrderById.get(item.orderId);
      if (
        (!preserveOverdue || !overdueOrderIds.has(item.orderId))
        && originalOrder?.estimatedAt?.getTime() !== item.estimatedAt?.getTime()
      ) {
        orderUpdates.push(
          tx.laundryOrder.update({
            where: { orderId: item.orderId },
            data: { estimatedAt: item.estimatedAt },
          })
        );
      }
    }

    await Promise.all([...stageUpdates, ...orderUpdates]);
    return schedule;
  }, { maxWait: 10_000, timeout: 30_000 });
}

export async function rescheduleLateOrder(storeId: number, orderId: number, now = new Date()) {
  const [orders, machines] = await Promise.all([
    prisma.laundryOrder.findMany({
      where: { storeId, status: { in: [...activeStatuses] } },
      include: { stages: true },
      orderBy: { orderId: "asc" },
    }),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  const order = orders.find((item) => item.orderId === orderId);
  const overdueStage = order?.stages.find((stage) => isStageOverdue(stage, now));
  if (!order || !overdueStage) return { status: "NOT_LATE" as const, orderId };

  const workflow = getWorkflowStages(order.serviceType);
  const previousStartAt = overdueStage.plannedStartAt;
  const previousEndAt = overdueStage.plannedEndAt;
  const occupied = orders
    .filter((item) => item.orderId !== orderId)
    .flatMap((item) => item.stages.map((stage) => ({ ...stage, orderId: item.orderId })));
  const proposedStages = order.stages.map((stage) => ({ ...stage, orderId: order.orderId }));
  let cursor = order.readyAt ?? order.createdAt ?? now;
  let replanning = false;

  for (const stageName of workflow) {
    const stage = proposedStages.find((item) => item.stage === stageName);
    if (!stage) continue;
    if (["COMPLETED", "RUNNING"].includes(stage.status)) {
      const machine = machines.find((item) => item.machineId === stage.machineId);
      const end = stage.status === "COMPLETED" && stage.actualEndedAt
        ? stage.actualEndedAt
        : stage.status === "RUNNING" && stage.actualStartedAt && machine
          ? new Date(stage.actualStartedAt.getTime() + getStageDuration(stage.stage, machine) * 60_000)
          : now;
      cursor = end > cursor ? end : cursor;
      occupied.push(stage);
      continue;
    }
    if (!replanning && stage.orderStageId !== overdueStage.orderStageId) {
      cursor = stage.plannedEndAt && stage.plannedEndAt > cursor ? stage.plannedEndAt : cursor;
      occupied.push(stage);
      continue;
    }
    replanning = true;
    const type = requiredMachineType(stage.stage);
    if (type) {
      const slot = findEarliestAvailableSlot(order, stage.stage, machines, occupied, cursor, now);
      stage.machineId = slot.machineId;
      stage.plannedStartAt = slot.plannedStartAt;
      stage.plannedEndAt = slot.plannedEndAt;
      cursor = slot.plannedEndAt;
    } else {
      stage.plannedStartAt = new Date(Math.max(cursor.getTime(), now.getTime()));
      stage.plannedEndAt = new Date(stage.plannedStartAt.getTime() + getStageDuration(stage.stage) * 60_000);
      cursor = stage.plannedEndAt;
    }
    occupied.push(stage);
  }

  const estimatedAt = calculateETA(order, proposedStages, machines, occupied, now);
  const groupOrders = order.groupCode
    ? orders.filter((item) => item.groupCode === order.groupCode)
    : [order];
  const groupETA = Math.max(
    estimatedAt.getTime(),
    ...groupOrders
      .filter((item) => item.orderId !== order.orderId && item.estimatedAt)
      .map((item) => item.estimatedAt!.getTime()),
  );
  const feasibility = checkDeadlineFeasibility(new Date(groupETA), order.pickupAt);
  if (feasibility.result !== "FEASIBLE") {
    return {
      status: "NOT_FEASIBLE" as const,
      orderId,
      estimatedAt,
      pickupAt: order.pickupAt,
    };
  }

  await prisma.$transaction(async (tx) => {
    for (const stage of proposedStages) {
      if (stage.status !== "PLANNED") continue;
      await tx.orderStage.update({
        where: { orderStageId: stage.orderStageId },
        data: {
          machineId: stage.machineId,
          plannedStartAt: stage.plannedStartAt,
          plannedEndAt: stage.plannedEndAt,
        },
      });
    }
    await tx.laundryOrder.update({ where: { orderId }, data: { estimatedAt } });
  }, { isolationLevel: "Serializable" });
  return {
    status: "RESCHEDULED" as const,
    orderId,
    previousStage: overdueStage.stage,
    previousStartAt,
    previousEndAt,
    estimatedAt,
    pickupAt: order.pickupAt,
    stages: proposedStages.filter((stage) => stage.status === "PLANNED"),
  };
}
export async function updateStatus(orderId: number, status: string) {
  return prisma.laundryOrder.update({
    where: { orderId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
    },
  });
}

export async function cancelOrder(orderId: number, storeId: number) {
  const order = await prisma.laundryOrder.findFirst({
    where: { orderId, storeId },
    include: { stages: { where: { status: "RUNNING" }, select: { orderStageId: true } } },
  });
  if (!order) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng");
  if (["COMPLETED", "READY", "NOTIFIED", "CANCELLED"].includes(order.status))
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Đơn không thể hủy ở trạng thái hiện tại");
  if (order.stages.length > 0)
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Không thể hủy đơn đang chạy trong máy");
  const updated = await prisma.laundryOrder.update({ where: { orderId }, data: { status: "CANCELLED" } });
  await refreshStoreSchedule(storeId);
  return updated;
}
