import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  ApiError,
} from "../lib/http.js";
import { findStoreOrders } from "../services/order.service.js";
import { recommend } from "../services/queue.service.js";
export const queue = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, recommend(await findStoreOrders(storeId)));
});
export const recommendation = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(
    res,
    recommend(await findStoreOrders(storeId), req.body?.excludeOrderIds ?? []),
  );
});
