import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  validateBody,
  ApiError,
} from "../lib/http.js";
import * as service from "../services/machine.service.js";
export const list = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.list(storeId));
});
export const detail = asyncRoute(async (req, res) =>
  ok(
    res,
    await service.detail(
      parseId(req.params.machineId, "machineId"),
      requireStore(req),
    ),
  ),
);
export const startRun = asyncRoute(async (req, res) => {
  const input = { ...req.body, stage: String(req.params.stage).toUpperCase() };
  ok(
    res,
    await service.startRun(
      parseId(req.params.orderId, "orderId"),
      requireStore(req),
      input,
    ),
  );
});
export const completeRun = asyncRoute(async (req, res) =>
  ok(
    res,
    await service.completeRun(
      parseId(req.params.orderStageId, "orderStageId"),
      requireStore(req),
    ),
  ),
);

export const markOutOfService = asyncRoute(async (req, res) => {
  validateBody(req.body, ["status"]);
  ok(
    res,
    await service.markOutOfService(
      parseId(req.params.machineId, "machineId"),
      requireStore(req),
      String(req.body.status).toUpperCase(),
    ),
  );
});
