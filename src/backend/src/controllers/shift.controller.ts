import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  validateBody,
  ApiError,
} from "../lib/http.js";
import * as service from "../services/shift.service.js";
export const employees = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(res, await service.listEmployees(storeId));
});
export const shifts = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  ok(
    res,
    await service.listShifts(
      storeId,
      req.query.date ? String(req.query.date) : undefined,
    ),
  );
});
export const assign = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId"))
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  validateBody(req.body, ["employeeId"]);
  ok(
    res,
    await service.assign(
      storeId,
      parseId(req.params.shiftId, "shiftId"),
      Number(req.body.employeeId),
    ),
  );
});
