import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { findStoreOrders } from "./order.service.js";
import { buildQueueSnapshot } from "./queue.service.js";
import { generateSchedule, checkDeadlineFeasibility } from "./scheduling.service.js";

export async function dashboard(storeId: number) {
  const [store, orders, machines] = await Promise.all([
    prisma.store.findUnique({ where: { storeId }, select: { storeId: true, name: true } }),
    findStoreOrders(storeId),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  if (!store) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  const queue = buildQueueSnapshot(orders, machines);
  return {
    store,
    summary: {
      pendingOrders: queue.summary.totalOrders,
      riskOrders: queue.summary.atRiskOrders,
      runningMachines: queue.summary.runningMachines,
      availableMachines: queue.summary.availableMachines,
    },
    nextTask: queue.recommendation
      ? {
          orderId: queue.recommendation.orderId,
          machineId: queue.recommendation.machineId,
          reason: queue.recommendation.priorityReason,
        }
      : null,
    attentionItems: queue.attentionItems.slice(0, 5),
  };
}

export async function checkDeadline(storeId: number, input: { pickupAt: string; weightKg: number; serviceType: string }) {
  const pickupAt = new Date(input.pickupAt);
  const now = new Date();
  const [machines, existingOrders] = await Promise.all([
    prisma.machine.findMany({ where: { storeId } }),
    prisma.laundryOrder.findMany({
      where: { storeId, status: { not: "COMPLETED" } },
      include: { stages: { include: { machine: true } } },
    }),
  ]);
  const order = {
    orderId: -1,
    weightKg: input.weightKg,
    serviceType: input.serviceType,
    readyAt: now,
    createdAt: now,
    stages: ["SORTING", ...(["WASH_DRY"].includes(input.serviceType) ? ["WASH", "TRANSFER", "DRY"] : [input.serviceType]), "PACKING"].map((stage) => ({ stage, status: "PLANNED" })),
  };
  let estimatedAt: Date | null = null;
  try {
    estimatedAt = generateSchedule([...existingOrders, order], machines, now).find(
      (item) => item.orderId === order.orderId,
    )?.estimatedAt ?? null;
  } catch {
    estimatedAt = null;
  }
  const result = checkDeadlineFeasibility(estimatedAt, pickupAt);
  return {
    result: result.result,
    estimatedAt,
    pickupAt,
    groupETA: null,
    requiredMinutes: estimatedAt ? Math.ceil((estimatedAt.getTime() - now.getTime()) / 60000) : null,
    affectedOrders: [],
    reason: result.result === "FEASIBLE" ? "Đủ thời gian xử lý" : "Cần kiểm tra lại lịch máy và giờ hẹn",
  };
}
