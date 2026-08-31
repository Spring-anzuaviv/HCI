import { asyncRoute, ok, requireStore, validateBody } from "../lib/http.js";
import * as service from "../services/auth.service.js";
import { env } from "../config/env.js";
export const login = asyncRoute(async (req, res) => {
  validateBody(req.body, ["email", "password"]);
  const result = await service.login(req.body.email, req.body.password);
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  });
  ok(res, { tokenType: result.tokenType, expiresIn: result.expiresIn, store: result.store });
});
export const me = asyncRoute(async (req, res) =>
  ok(res, await service.currentStore(requireStore(req))),
);
export const logout = (_req: any, res: any) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: env.cookieSecure, sameSite: "lax", path: "/" });
  ok(res, { loggedOut: true });
};
export const changePassword = asyncRoute(async (req, res) => {
  validateBody(req.body, ["currentPassword", "newPassword"]);
  ok(res, await service.changePassword(requireStore(req), String(req.body.currentPassword), String(req.body.newPassword)));
});
