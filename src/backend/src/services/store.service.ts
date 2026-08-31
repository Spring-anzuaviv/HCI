import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { activeStatuses, findStoreOrders, serializeOrder } from "./order.service.js";
import { generateSchedule, checkDeadlineFeasibility, getWorkflowStages } from "./scheduling.service.js";

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

export async function checkDeadlineGroup(storeId: number, input: { pickupAt: string; parts: Array<{ weightKg: number; serviceType: string }> }) {
  const now = new Date();
  const [machines, existingOrders] = await Promise.all([
    prisma.machine.findMany({ where: { storeId } }),
    prisma.laundryOrder.findMany({ where: { storeId, status: { not: "COMPLETED" } }, include: { stages: { include: { machine: true } } } }),
  ]);
  const parts = input.parts.map((part, index) => ({
    orderId: -(index + 1), weightKg: Number(part.weightKg), serviceType: part.serviceType,
    readyAt: now, createdAt: now, pickupAt: new Date(input.pickupAt), groupCode: "PREVIEW-GROUP",
    stages: getWorkflowStages(part.serviceType).map(stage => ({ stage, status: "PLANNED" })),
  }));
  const schedule = generateSchedule([...existingOrders, ...parts], machines, now);
  const previews = schedule.filter(item => item.orderId < 0).sort((a, b) => b.orderId - a.orderId);
  const groupETA = previews.reduce<Date | null>((latest, item) => !latest || item.groupETA > latest ? item.groupETA : latest, null);
  const feasibility = checkDeadlineFeasibility(groupETA, new Date(input.pickupAt));
  return {
    result: feasibility.result,
    reason: feasibility.result === "FEASIBLE" ? "Đủ thời gian xử lý toàn bộ các mẻ" : "Giờ hẹn không khả thi cho toàn bộ nhóm",
    groupETA,
    parts: previews.map(item => ({ orderId: item.orderId, estimatedAt: item.estimatedAt })),
  };
}

export async function stats(storeId: number) {
  const [orders, machines] = await Promise.all([
    prisma.laundryOrder.findMany({ where: { storeId } }),
    prisma.machine.findMany({ where: { storeId }, include: { stages: true } }),
  ]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(order => order.createdAt >= today);
  const services = ["WASH_DRY", "WASH", "DRY"].map(type => {
    const count = todayOrders.filter(order => order.serviceType === type).length;
    return { type, count };
  });
  const total = services.reduce((sum, item) => sum + item.count, 0);
  const completedToday = todayOrders.filter(order => order.status === "COMPLETED").length;
  const lateOrders = orders.filter(order => order.pickupAt && order.estimatedAt && order.estimatedAt > order.pickupAt).length;
  const machineStages = machines.flatMap(machine => machine.stages.filter(stage => stage.status === "RUNNING" || stage.status === "COMPLETED"));
  return {
    completedToday,
    lateOrders,
    machineEfficiency: machines.length ? Math.round((machineStages.length / Math.max(1, machines.length * 8)) * 100) : 0,
    weekChart: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label, index) => ({ label, val: index === 0 ? todayOrders.length : 0, bottom: 28, highlight: index === 0 })),
    services: services.map(item => ({ color: item.type === "WASH_DRY" ? "var(--pu)" : item.type === "WASH" ? "var(--bl)" : "var(--am)", label: item.type === "WASH_DRY" ? "Giặt + Sấy" : item.type === "WASH" ? "Chỉ Giặt" : "Sấy khô", pct: `${total ? Math.round(item.count / total * 100) : 0}%` })),
  };
}

export async function shiftSummary(storeId: number) {
  const [orders, machines] = await Promise.all([
    findStoreOrders(storeId),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  const data = orders.map(serializeOrder);
  const active = data.filter((order: any) => activeStatuses.has(order.status));
  return {
    generatedAt: new Date(),
    totals: {
      orders: data.length,
      completed: data.filter((order: any) => order.status === "COMPLETED").length,
      active: active.length,
      atRisk: active.filter((order: any) => order.riskLevel !== "LOW").length,
      waiting: active.filter((order: any) => order.status === "WAITING").length,
    },
    machines: {
      running: machines.filter((machine) => machine.status === "RUNNING").length,
      available: machines.filter((machine) => machine.status === "AVAILABLE").length,
      total: machines.length,
    },
    attention: active
      .filter((order: any) => order.riskLevel !== "LOW" || order.status === "WAITING")
      .slice(0, 5)
      .map((order: any) => ({
        orderId: order.orderId,
        customerName: order.customer.name,
        status: order.status,
        riskLevel: order.riskLevel,
        nextAction: order.nextAction,
        pickupAt: order.pickupAt,
      })),
  };
}

export async function updateName(storeId: number, name: string) {
  if (!name.trim()) throw new ApiError(400, "VALIDATION_ERROR", "Tên cửa hàng không được để trống");
  return prisma.store.update({ where: { storeId }, data: { name: name.trim() }, select: { storeId: true, name: true } });
}
