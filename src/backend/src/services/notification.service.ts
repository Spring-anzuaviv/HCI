import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { findOrderForStore } from "./order.service.js";

type GroupableOrder = {
  orderId: number;
  groupCode: string | null;
};

/** Mỗi đơn thường là một card; mỗi nhóm đơn tách chỉ là một card đại diện. */
export function collapseNotificationGroups<T extends GroupableOrder>(orders: T[]) {
  const result: Array<T & { groupCount: number; orderIds: number[] }> = [];
  const grouped = new Map<string, T[]>();

  for (const order of [...orders].sort((left, right) => left.orderId - right.orderId)) {
    if (!order.groupCode) {
      result.push({ ...order, groupCount: 1, orderIds: [order.orderId] });
      continue;
    }
    const members = grouped.get(order.groupCode) ?? [];
    members.push(order);
    grouped.set(order.groupCode, members);
  }

  for (const members of grouped.values()) {
    const representative = members[0];
    result.push({
      ...representative,
      groupCount: members.length,
      orderIds: members.map(member => member.orderId),
    });
  }

  return result.sort((left, right) => left.orderId - right.orderId);
}

export async function pending(storeId: number) {
  const [orders, allGroupedOrders, store] = await Promise.all([
    prisma.laundryOrder.findMany({
      where: { storeId, status: "READY" },
      include: { customer: true },
      orderBy: { orderId: "asc" },
    }),
    prisma.laundryOrder.findMany({
      where: { storeId, groupCode: { not: null } },
      select: { orderId: true, groupCode: true, status: true },
    }),
    prisma.store.findUnique({ where: { storeId }, select: { name: true } }),
  ]);
  const groupReadiness = new Map<string, boolean>();
  for (const item of allGroupedOrders) {
    if (!item.groupCode) continue;
    groupReadiness.set(
      item.groupCode,
      (groupReadiness.get(item.groupCode) ?? true) && item.status === "READY",
    );
  }
  const completeGroups = new Set(
    [...groupReadiness.entries()]
      .filter(([, isReady]) => isReady)
      .map(([groupCode]) => groupCode),
  );
  const storeName = store?.name || "cửa hàng";
  return collapseNotificationGroups(
    orders.filter((order) => !order.groupCode || completeGroups.has(order.groupCode)),
  )
    .map((order) => ({
      ...order,
      notificationPreview: {
        channel: "ZALO",
        recipient: order.customer?.phone ?? "",
        content: order.groupCount > 1
          ? `Chào ${order.customer?.name ?? "bạn"}, cả ${order.groupCount} mẻ đồ của bạn đã sạch và sẵn sàng. Cảm ơn đã tin dùng ${storeName}!`
          : `Chào ${order.customer?.name ?? "bạn"}, đồ của bạn đã sạch và sẵn sàng. Cảm ơn đã tin dùng ${storeName}!`,
      },
    }));
}

export async function notified(storeId: number) {
  const orders = await prisma.laundryOrder.findMany({
    where: { storeId, status: "NOTIFIED" },
    include: { customer: true },
    orderBy: { orderId: "asc" },
  });
  return collapseNotificationGroups(orders);
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
export async function send(orderId: number, storeId: number) {
  const order = await prisma.laundryOrder.findFirst({ where: { orderId, storeId } });
  if (!order) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng");

  const members = order.groupCode
    ? await prisma.laundryOrder.findMany({
        where: { storeId, groupCode: order.groupCode },
        orderBy: { orderId: "asc" },
      })
    : [order];

  if (members.every(member => member.status === "NOTIFIED")) {
    return {
      success: true,
      alreadyNotified: true,
      groupCode: order.groupCode,
      orderIds: members.map(member => member.orderId),
    };
  }
  if (members.some(member => member.status !== "READY")) {
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Chỉ gửi thông báo khi toàn bộ mẻ trong đơn đã sẵn sàng");
  }

  await prisma.laundryOrder.updateMany({
    where: { storeId, orderId: { in: members.map(member => member.orderId) }, status: "READY" },
    data: { status: "NOTIFIED" },
  });
  return {
    success: true,
    groupCode: order.groupCode,
    orderIds: members.map(member => member.orderId),
    message: "Đã đánh dấu thông báo thành công",
  };
}

export async function complete(orderId: number, storeId: number) {
  const order = await prisma.laundryOrder.findFirst({ where: { orderId, storeId } });
  if (!order) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng");
  const members = order.groupCode
    ? await prisma.laundryOrder.findMany({
        where: { storeId, groupCode: order.groupCode },
        orderBy: { orderId: "asc" },
      })
    : [order];

  if (members.every(member => member.status === "COMPLETED")) {
    return {
      success: true,
      alreadyCompleted: true,
      groupCode: order.groupCode,
      orderIds: members.map(member => member.orderId),
    };
  }
  const deliverableStatuses = new Set(["READY", "NOTIFIED", "COMPLETED"]);
  if (members.some(member => !deliverableStatuses.has(member.status))) {
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Đơn hàng chưa sẵn sàng để giao");
  }
  const now = new Date();
  await prisma.laundryOrder.updateMany({
    where: {
      storeId,
      orderId: { in: members.map(member => member.orderId) },
      status: { in: ["READY", "NOTIFIED"] },
    },
    data: { status: "COMPLETED", completedAt: now },
  });
  return {
    success: true,
    groupCode: order.groupCode,
    orderIds: members.map(member => member.orderId),
    message: "Đã hoàn tất đơn hàng",
  };
}
