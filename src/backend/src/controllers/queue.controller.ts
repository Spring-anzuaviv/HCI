import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  ApiError,
} from "../lib/http.js";
import { findStoreOrders, serializeOrders } from "../services/order.service.js";
import { recommend } from "../services/queue.service.js";
import { buildQueueSnapshot } from "../services/queue.service.js";
import { buildMachineRecommendation } from "../services/smart-queue.js";
import { list as listMachines } from "../services/machine.service.js";
import { prisma } from "../lib/prisma.js";

/** Gộp 2 queries song song để giảm latency */
async function fetchOrdersAndMachines(storeId: number) {
  return Promise.all([
    findStoreOrders(storeId),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
}

export const queue = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  const [orders, machines] = await fetchOrdersAndMachines(storeId);
  ok(res, recommend(orders, machines));
});

/**
 * Snapshot vận hành dùng cho lần tải chính của frontend.
 * Orders và machines chỉ được đọc một lần rồi tái sử dụng để dựng queue.
 */
export const operations = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");

  const [orders, machines] = await Promise.all([
    findStoreOrders(storeId),
    listMachines(storeId),
  ]);
  ok(res, {
    orders: serializeOrders(orders),
    machines,
    queue: buildQueueSnapshot(orders, machines),
  });
});

export const recommendation = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  const [orders, machines] = await fetchOrdersAndMachines(storeId);
  ok(res, recommend(orders, machines, req.body?.excludeOrderIds ?? []));
});

export const machineRecommendation = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  const machineId = parseId(req.params.machineId, "machineId");
  const [machine, orders] = await Promise.all([
    prisma.machine.findFirst({ where: { machineId, storeId } }),
    findStoreOrders(storeId),
  ]);
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  ok(res, buildMachineRecommendation(orders, machine));
});
