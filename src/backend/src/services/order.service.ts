import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import {
  getWorkflowStages,
  checkDeadlineFeasibility,
  generateSchedule,
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
  "READY",
  "NOTIFIED",
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
export async function findStoreOrders(storeId: number) {
  return prisma.laundryOrder.findMany({
    where: { storeId },
    include: orderInclude,
  });
}
export async function createOrder(storeId: number, input: any) {
  getWorkflowStages(input.serviceType);
  const customer = await prisma.customer.upsert({
    where: { phone: input.customer.phone },
    update: { name: input.customer.name },
    create: { name: input.customer.name, phone: input.customer.phone },
  });
  const created = await prisma.laundryOrder.create({
    data: {
      customerId: customer.customerId,
      storeId,
      weightKg: Number(input.weightKg),
      serviceType: input.serviceType,
      status: "WAITING",
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
    include: orderInclude,
  });
  await refreshStoreSchedule(storeId);
  return findOrderForStore(created.orderId, storeId);
}

export async function refreshStoreSchedule(storeId: number) {
  const [orders, machines] = await Promise.all([
    prisma.laundryOrder.findMany({
      where: { storeId },
      include: { stages: { include: { machine: true } } },
    }),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  const schedule = generateSchedule(orders, machines);
  // Recalculating a busy store updates multiple stages and orders. Keep the
  // write atomic, but allow enough time for PostgreSQL to finish the batch.
  return prisma.$transaction(async (tx) => {
    for (const item of schedule) {
      for (const stage of item.stages) {
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
      await tx.laundryOrder.update({
        where: { orderId: item.orderId },
        data: { estimatedAt: item.estimatedAt },
      });
    }
    return schedule;
  }, { maxWait: 10_000, timeout: 30_000 });
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
