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

export async function notified(storeId: number) {
  const orders = await prisma.laundryOrder.findMany({
    where: { storeId, status: "NOTIFIED" },
    include: { customer: true },
  });
  return orders;
}

export async function preview(
  orderId: number,
  storeId: number,
  channel = "ZALO",
) {
  const [order, store] = await Promise.all([
    findOrderForStore(orderId, storeId),
    prisma.store.findUnique({ where: { storeId }, select: { name: true } })
  ]);
  const storeName = store?.name || "cửa hàng";

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
    content: `Chào ${order.customer?.name ?? "bạn"}, đồ của bạn đã sạch và sẵn sàng. Cảm ơn đã tin dùng ${storeName}!`,
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
export async function send(orderId: number) {
  const order = await prisma.laundryOrder.findUnique({ where: { orderId } });
  if (!order || order.status !== "READY") {
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Đơn hàng không ở trạng thái READY");
  }

  // Nếu có groupCode, cập nhật cả nhóm
  if (order.groupCode) {
    await prisma.laundryOrder.updateMany({
      where: { groupCode: order.groupCode, status: "READY" },
      data: { status: "NOTIFIED" }
    });
  } else {
    await prisma.laundryOrder.update({
      where: { orderId },
      data: { status: "NOTIFIED" }
    });
  }
  return { success: true, message: "Đã đánh dấu thông báo thành công" };
}

export async function complete(orderId: number) {
  const order = await prisma.laundryOrder.findUnique({ where: { orderId } });
  if (!order || (order.status !== "READY" && order.status !== "NOTIFIED")) {
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Đơn hàng chưa sẵn sàng để giao");
  }

  const now = new Date();
  if (order.groupCode) {
    await prisma.laundryOrder.updateMany({
      where: { groupCode: order.groupCode },
      data: { status: "COMPLETED", completedAt: now }
    });
  } else {
    await prisma.laundryOrder.update({
      where: { orderId },
      data: { status: "COMPLETED", completedAt: now }
    });
  }
  return { success: true, message: "Đã hoàn tất đơn hàng" };
}
