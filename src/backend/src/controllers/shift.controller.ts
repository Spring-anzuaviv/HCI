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
export const createEmployee = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (storeId !== parseId(req.params.storeId, "storeId")) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  validateBody(req.body, ["name"]);
  if (!String(req.body.name).trim()) throw new ApiError(400, "VALIDATION_ERROR", "Tên nhân viên không được để trống");
  ok(res, await service.createEmployee(storeId, req.body));
});
export const updateEmployee = asyncRoute(async (req, res) => {
  validateBody(req.body, []);
  ok(res, await service.updateEmployee(parseId(req.params.employeeId, "employeeId"), requireStore(req), req.body));
});
export const deleteEmployee = asyncRoute(async (req, res) =>
  ok(res, await service.deleteEmployee(parseId(req.params.employeeId, "employeeId"), requireStore(req))));
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
export const unassign = asyncRoute(async (req, res) =>
  ok(res, await service.unassign(requireStore(req), parseId(req.params.shiftId, "shiftId"), parseId(req.params.employeeId, "employeeId"))));
