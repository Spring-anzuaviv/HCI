import {
  asyncRoute,
  ok,
  parseId,
  requireStore,
  validateBody,
} from "../lib/http.js";
import { check } from "../services/expedite.service.js";
export const expedite = asyncRoute(async (req, res) => {
  validateBody(req.body, ["newPickupAt"]);
  ok(
    res,
    await check(
      parseId(req.params.orderId, "orderId"),
      requireStore(req),
      req.body.newPickupAt,
    ),
  );
});
