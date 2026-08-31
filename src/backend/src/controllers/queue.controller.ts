import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  ApiError,
} from "../lib/http.js";
import { findStoreOrders } from "../services/order.service.js";
import { recommend } from "../services/queue.service.js";
import { buildMachineRecommendation } from "../services/smart-queue.js";
import { prisma } from "../lib/prisma.js";
export const queue = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, recommend(await findStoreOrders(storeId), await prisma.machine.findMany({ where: { storeId } })));
});
export const recommendation = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(
    res,
    recommend(await findStoreOrders(storeId), await prisma.machine.findMany({ where: { storeId } }), req.body?.excludeOrderIds ?? []),
  );
});

export const machineRecommendation = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  const machineId = parseId(req.params.machineId, "machineId");
  const machine = await prisma.machine.findFirst({ where: { machineId, storeId } });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  ok(res, buildMachineRecommendation(await findStoreOrders(storeId), machine));
});
