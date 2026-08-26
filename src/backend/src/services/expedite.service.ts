import { findOrderForStore } from "./order.service.js";
export async function check(
  orderId: number,
  storeId: number,
  newPickupAt: string,
) {
  const order = await findOrderForStore(orderId, storeId);
  const pickup = new Date(newPickupAt);
  const feasible = !!order.estimatedAt && order.estimatedAt <= pickup;
  return {
    orderId,
    feasibility: feasible ? "FEASIBLE" : "NOT_FEASIBLE",
    newEstimatedAt: order.estimatedAt,
    affectedOrders: [],
    reason: feasible
      ? "Còn đủ thời gian xử lý"
      : "Không đủ thời gian theo ETA hiện tại",
  };
}
