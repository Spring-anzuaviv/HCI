import { asyncRoute, ok, requireStore, validateBody } from "../lib/http.js";
import * as service from "../services/auth.service.js";
export const login = asyncRoute(async (req, res) => {
  validateBody(req.body, ["email", "password"]);
  ok(res, await service.login(req.body.email, req.body.password));
});
export const me = asyncRoute(async (req, res) =>
  ok(res, await service.currentStore(requireStore(req))),
);
export const logout = (_req: any, res: any) => ok(res, { loggedOut: true });
