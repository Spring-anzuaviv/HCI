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

export const notified = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.notified(storeId));
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
export const send = asyncRoute(async (req, res) => {
  ok(
    res,
    await service.send(
      parseId(req.params.orderId, "orderId"),
      requireStore(req),
    ),
  );
});

export const complete = asyncRoute(async (req, res) => {
  ok(
    res,
    await service.complete(
      parseId(req.params.orderId, "orderId"),
      requireStore(req),
    ),
  );
});

export const handover = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.handover(storeId));
});
