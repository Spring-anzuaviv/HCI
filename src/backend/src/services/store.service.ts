import { prisma } from "../lib/prisma.js";
import {
  activeStatuses,
  estimateMinutes,
  findStoreOrders,
  serializeOrder,
} from "./order.service.js";
import { ApiError } from "../lib/http.js";

export async function dashboard(storeId: number) {
  const [store, orders, machines] = await Promise.all([
    prisma.store.findUnique({
      where: { storeId },
      select: { storeId: true, name: true },
    }),
    findStoreOrders(storeId),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  if (!store) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  const data = orders.map(serializeOrder);
  const pending = data.filter((order: any) => activeStatuses.has(order.status));
  return {
    store,
    summary: {
      pendingOrders: pending.length,
      riskOrders: data.filter((order: any) => order.riskLevel !== "LOW").length,
      runningMachines: machines.filter(
        (machine) => machine.status === "RUNNING",
      ).length,
      availableMachines: machines.filter(
        (machine) => machine.status === "AVAILABLE",
      ).length,
    },
    nextTask: pending[0]
      ? { orderId: pending[0].orderId, reason: pending[0].priorityReason }
      : null,
    attentionItems: data
      .filter((order: any) => order.riskLevel !== "LOW")
      .slice(0, 5),
  };
}

export function checkDeadline(input: {
  pickupAt: string;
  weightKg: number;
  serviceType: string;
}) {
  const pickup = new Date(input.pickupAt);
  const requiredMinutes = estimateMinutes(
    input.serviceType,
    Number(input.weightKg),
  );
  const availableAt = new Date(Date.now() + requiredMinutes * 60000);
  const bufferMinutes = 30;
  const safe = new Date(availableAt.getTime() + bufferMinutes * 60000);
  const result =
    safe <= pickup
      ? "FEASIBLE"
      : availableAt <= pickup
        ? "AT_RISK"
        : "NOT_FEASIBLE";
  return {
    result,
    availableAt,
    latestSafePickup: new Date(pickup.getTime() + 10 * 60000),
    requiredMinutes,
    bufferMinutes,
    affectedOrders: [],
    reason:
      result === "FEASIBLE"
        ? "Đủ thời gian cho các stage và khoảng dự phòng"
        : "Cần kiểm tra lại hàng chờ hoặc thời hạn",
  };
}
