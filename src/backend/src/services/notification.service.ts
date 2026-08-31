import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { findOrderForStore } from "./order.service.js";
export async function pending(storeId: number) {
  const orders = await prisma.laundryOrder.findMany({
    where: { storeId, status: "READY" },
    include: { customer: true },
  });
  const allGroupedOrders = await prisma.laundryOrder.findMany({
    where: { storeId, groupCode: { not: null } },
    select: { groupCode: true, status: true },
  });
  const completeGroups = new Set(
    [...new Set(allGroupedOrders.map((item) => item.groupCode))].filter((code) =>
      allGroupedOrders.filter((item) => item.groupCode === code).every((item) => item.status === "READY"),
    ),
  );
  return orders.filter((order) => !order.groupCode || completeGroups.has(order.groupCode));
}
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
  if (order.groupCode) {
    const group = await prisma.laundryOrder.findMany({
      where: { storeId, groupCode: order.groupCode },
      select: { orderId: true, status: true },
    });
    if (group.some((item) => item.status !== "READY"))
      throw new ApiError(409, "WORKFLOW_CONFLICT", "Nhóm đơn chưa hoàn tất toàn bộ");
  }
  return {
    orderId,
    channel,
    recipient: order.customer?.phone ?? "",
      content: `Chào ${order.customer?.name ?? "bạn"}, các đơn trong nhóm ${order.groupCode ?? `L-${orderId}`} đã hoàn tất và sẵn sàng để nhận.`,
  };
}
export async function handover(storeId: number) {
  const orders = await prisma.laundryOrder.findMany({
    where: {
      status: { not: "COMPLETED" },
      storeId,
    },
    include: { customer: true, stages: { include: { machine: true } } },
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
