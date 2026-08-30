import { serializeOrder, activeStatuses } from "./order.service.js";
import { getWorkQueue } from "./scheduling.service.js";

export function recommend(orders: any[], machines: any[] = [], excluded: number[] = []) {
  const eligible = orders.filter(
    (order) => activeStatuses.has(order.status) && !excluded.includes(order.orderId),
  );
  const work = getWorkQueue(eligible, machines);
  const byOrder = new Map(work.map((stage) => [stage.orderId, stage]));
  return eligible
    .map((order) => ({ ...serializeOrder(order), nextStage: byOrder.get(order.orderId) ?? null }))
    .sort(
      (a, b) =>
        Number(b.riskLevel !== "LOW") - Number(a.riskLevel !== "LOW") ||
        (a.pickupAt?.getTime?.() ?? Infinity) - (b.pickupAt?.getTime?.() ?? Infinity) ||
        b.stages.length - a.stages.length ||
        a.createdAt.getTime() - b.createdAt.getTime() ||
        a.orderId - b.orderId,
    )
    .map((order, index) => ({ ...order, rank: index + 1 }));
}
