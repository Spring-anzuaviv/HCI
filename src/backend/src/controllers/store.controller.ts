import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  validateBody,
  ApiError,
} from "../lib/http.js";
import * as service from "../services/store.service.js";
export const dashboard = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (parseId(req.params.storeId, "storeId") !== storeId)
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.dashboard(storeId));
});
export const deadlineCheck = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  validateBody(req.body, ["pickupAt", "weightKg", "serviceType"]);
  ok(res, await service.checkDeadline(storeId, req.body));
});
export const stats = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (parseId(req.params.storeId, "storeId") !== storeId) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.stats(storeId));
});
export const shiftSummary = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (parseId(req.params.storeId, "storeId") !== storeId) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.shiftSummary(storeId));
});
export const updateName = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (parseId(req.params.storeId, "storeId") !== storeId) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  validateBody(req.body, ["name"]);
  ok(res, await service.updateName(storeId, String(req.body.name)));
});
