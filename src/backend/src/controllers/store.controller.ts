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
