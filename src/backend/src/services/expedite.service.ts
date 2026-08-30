import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { findOrderForStore } from "./order.service.js";
import { refreshStoreSchedule } from "./order.service.js";
import { generateSchedule, checkDeadlineFeasibility } from "./scheduling.service.js";

export async function check(orderId: number, storeId: number, newPickupAt: string) {
  const order = await findOrderForStore(orderId, storeId);
  const pickupAt = new Date(newPickupAt);
  if (Number.isNaN(pickupAt.getTime()) || pickupAt <= new Date())
    throw new ApiError(400, "VALIDATION_ERROR", "Giờ lấy mới không hợp lệ");
  const [orders, machines] = await Promise.all([
    prisma.laundryOrder.findMany({
      where: { storeId },
      include: { stages: { include: { machine: true } } },
    }),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  const simulatedOrders = orders.map((item) =>
    item.orderId === orderId || (order.groupCode && item.groupCode === order.groupCode)
      ? { ...item, pickupAt }
      : item,
  );
  const schedule = generateSchedule(simulatedOrders, machines);
  const simulated = schedule.find((item) => item.orderId === orderId);
  if (!simulated) throw new ApiError(409, "SCHEDULE_CONFLICT", "Không thể mô phỏng lịch");
  const feasibility = checkDeadlineFeasibility(simulated.estimatedAt, pickupAt);
  return {
    orderId,
    feasibility: feasibility.result,
    newEstimatedAt: simulated.estimatedAt,
    groupETA: simulated.groupETA,
    affectedOrders: schedule
      .filter((item) => item.orderId !== orderId)
      .map((item) => ({ orderId: item.orderId, estimatedAt: item.estimatedAt, groupETA: item.groupETA })),
    reason:
      feasibility.result === "FEASIBLE"
        ? "Lịch mô phỏng vẫn đáp ứng giờ hẹn"
        : feasibility.result === "AT_RISK"
          ? "Lịch mô phỏng sát giờ hẹn"
          : "Lịch mô phỏng không đáp ứng giờ hẹn",
  };
}

export async function apply(orderId: number, storeId: number, newPickupAt: string) {
  const order = await findOrderForStore(orderId, storeId);
  const pickupAt = new Date(newPickupAt);
  if (Number.isNaN(pickupAt.getTime()) || pickupAt <= new Date())
    throw new ApiError(400, "VALIDATION_ERROR", "Giờ lấy mới không hợp lệ");
  await prisma.laundryOrder.updateMany({
    where: { storeId, ...(order.groupCode ? { groupCode: order.groupCode } : { orderId }) },
    data: { pickupAt },
  });
  await refreshStoreSchedule(storeId);
  return findOrderForStore(orderId, storeId);
}
