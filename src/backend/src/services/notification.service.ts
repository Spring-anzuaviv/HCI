import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { findOrderForStore } from "./order.service.js";
export const pending = (storeId: number) =>
  prisma.laundryOrder.findMany({
    where: { status: "READY", machineRuns: { some: { machine: { storeId } } } },
    include: { customer: true },
  });
export async function preview(
  orderId: number,
  storeId: number,
  channel = "ZALO",
) {
  const order = await findOrderForStore(orderId, storeId);
  if (order.status !== "READY")
    throw new ApiError(
      409,
      "WORKFLOW_CONFLICT",
      "Chỉ gửi thông báo khi đơn READY",
    );
  return {
    orderId,
    channel,
    recipient: order.customer.phone,
    content: `Chào ${order.customer.name}, đơn L-${orderId} đã hoàn tất và sẵn sàng để nhận.`,
  };
}
export async function handover(storeId: number) {
  const orders = await prisma.laundryOrder.findMany({
    where: {
      status: { not: "COMPLETED" },
      machineRuns: { some: { machine: { storeId } } },
    },
    include: { customer: true, machineRuns: { include: { machine: true } } },
  });
  return orders;
}
export function send() {
  throw new ApiError(
    501,
    "NOTIFICATION_PROVIDER_NOT_IMPLEMENTED",
    "Zalo sandbox chưa được triển khai",
  );
}
