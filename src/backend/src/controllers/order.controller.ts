import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  validateBody,
  ApiError,
} from "../lib/http.js";
import * as service from "../services/order.service.js";
export const get = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  const orderId = parseId(req.params.orderId, "orderId");
  ok(res, await service.findSerializedOrderForStore(orderId, storeId));
});
export const create = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (parseId(req.params.storeId, "storeId") !== storeId)
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  validateBody(req.body, ["customer", "weightKg", "serviceType"]);
  if (
    !req.body.customer?.name ||
    !req.body.customer?.phone ||
    Number(req.body.weightKg) <= 0
  )
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Thông tin đơn hàng không hợp lệ",
    );
  ok(res, service.serializeOrder(await service.createOrder(storeId, req.body)));
});
export const createBatch = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (parseId(req.params.storeId, "storeId") !== storeId)
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  const orders = req.body?.orders;
  if (!Array.isArray(orders) || orders.length < 2 || orders.length > 20)
    throw new ApiError(400, "VALIDATION_ERROR", "Số mẻ phải từ 2 đến 20");
  for (const order of orders) {
    if (
      !order?.customer?.name ||
      !order?.customer?.phone ||
      Number(order?.weightKg) <= 0 ||
      !order?.serviceType
    ) throw new ApiError(400, "VALIDATION_ERROR", "Thông tin mẻ không hợp lệ");
  }
  ok(res, service.serializeOrders(await service.createOrders(storeId, orders)));
});
export const updateStatus = asyncRoute(async (req, res) => {
  const order = await service.findOrderForStore(
    parseId(req.params.orderId, "orderId"),
    requireStore(req),
  );
  validateBody(req.body, ["status"]);
  const target = service.stages.indexOf(String(req.body.status) as any),
    current = service.stages.indexOf(order.status as any);
  if (target < 0 || target !== current + 1)
    throw new ApiError(
      409,
      "WORKFLOW_CONFLICT",
      "Trạng thái không theo đúng chuỗi workflow",
    );
  const updated = await service.updateStatus(order.orderId, req.body.status);
  ok(res, {
    status: updated.status,
    estimatedAt: updated.estimatedAt,
    nextAction: service.getNextAction(updated.status),
  });
});
export const cancel = asyncRoute(async (req, res) => {
  const updated = await service.cancelOrder(
    parseId(req.params.orderId, "orderId"),
    requireStore(req),
  );
  ok(res, { status: updated.status });
});
export const list = asyncRoute(async (req, res) => {
  const storeId = requireStore(req);
  if (parseId(req.params.storeId, "storeId") !== storeId)
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  let orders = await service.findStoreOrders(storeId);
  if (req.query.status)
    orders = orders.filter((o: any) => o.status === req.query.status);
  if (req.query.search)
    orders = orders.filter((o: any) => {
      const search = String(req.query.search).trim().toLowerCase();
      const orderId = search.replace(/^#/, "");
      return (
        o.customer.name.toLowerCase().includes(search) ||
        o.customer.phone.replace(/\s/g, "").includes(search.replace(/\s/g, "")) ||
        String(o.orderId) === orderId
      );
    });
  const page = Math.max(1, Number(req.query.page ?? 1)),
    limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const data = service.serializeOrders(orders);
  ok(res, data.slice((page - 1) * limit, page * limit), {
    page,
    limit,
    total: data.length,
  });
});
