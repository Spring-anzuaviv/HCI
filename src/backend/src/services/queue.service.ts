import { serializeOrder, activeStatuses } from "./order.service.js";
export function recommend(orders: any[], excluded: number[] = []) {
  return orders
    .filter(
      (order) =>
        activeStatuses.has(order.status) && !excluded.includes(order.orderId),
    )
    .map(serializeOrder)
    .sort(
      (a, b) =>
        Number(b.riskLevel !== "LOW") - Number(a.riskLevel !== "LOW") ||
        (a.pickupAt?.getTime?.() ?? Infinity) -
          (b.pickupAt?.getTime?.() ?? Infinity) ||
        b.machineRuns.length - a.machineRuns.length ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    )
    .map((order, index) => ({ ...order, rank: index + 1 }));
}
