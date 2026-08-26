import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  ApiError,
} from "../lib/http.js";
import * as service from "../services/notification.service.js";
export const pending = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.pending(storeId));
});
export const preview = asyncRoute(async (req, res) =>
  ok(
    res,
    await service.preview(
      parseId(req.params.orderId, "orderId"),
      requireStore(req),
      req.body?.channel,
    ),
  ),
);
export const send = asyncRoute(async () => service.send());
export const handover = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.handover(storeId));
});
