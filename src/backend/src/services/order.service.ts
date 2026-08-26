import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";

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
  machineRuns: {
    include: { machine: true },
    orderBy: { startedAt: "desc" as const },
  },
};
export const estimateMinutes = (service: string, weight: number) =>
  Math.round(
    (service === "COMBO" ? 115 : service === "WASH" ? 45 : 50) + weight * 3,
  );
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
  if (
    !order.pickupAt ||
    !order.estimatedAt ||
    !activeStatuses.has(order.status)
  )
    return "LOW";
  if (order.estimatedAt > order.pickupAt) return "HIGH";
  return order.pickupAt.getTime() - order.estimatedAt.getTime() < 1800000
    ? "MEDIUM"
    : "LOW";
}
export function serializeOrder(order: any) {
  const risk = riskLevel(order);
  const current = order.machineRuns?.find((run: any) => !run.endedAt);
  return {
    ...order,
    weightKg: Number(order.weightKg),
    riskLevel: risk,
    currentStage: current?.stage ?? order.status,
    currentMachine: current?.machine ?? null,
    nextAction: getNextAction(order.status),
    priorityReason:
      risk === "HIGH" ? "Đã vượt hoặc sắp đến hạn" : "Theo thứ tự công việc",
  };
}
export async function findOrderForStore(orderId: number, storeId: number) {
  const order = await prisma.laundryOrder.findFirst({
    where: { orderId, machineRuns: { some: { machine: { storeId } } } },
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
    where: { machineRuns: { some: { machine: { storeId } } } },
    include: orderInclude,
  });
}
export async function createOrder(storeId: number, input: any) {
  const machine = await prisma.machine.findFirst({ where: { storeId } });
  const customer = await prisma.customer.upsert({
    where: { phone: input.customer.phone },
    update: { name: input.customer.name },
    create: { name: input.customer.name, phone: input.customer.phone },
  });
  return prisma.laundryOrder.create({
    data: {
      customerId: customer.customerId,
      weightKg: Number(input.weightKg),
      serviceType: input.serviceType,
      status: "WAITING",
      pickupAt: input.pickupAt ? new Date(input.pickupAt) : null,
      estimatedAt: new Date(
        Date.now() +
          estimateMinutes(input.serviceType, Number(input.weightKg)) * 60000,
      ),
      machineRuns: machine
        ? {
            create: {
              machineId: machine.machineId,
              stage: "WAITING",
              startedAt: new Date(),
              status: "PENDING",
            },
          }
        : undefined,
    },
    include: orderInclude,
  });
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
