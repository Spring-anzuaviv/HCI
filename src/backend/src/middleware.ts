import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./lib/auth.js";
import { ApiError } from "./lib/http.js";

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.requestId = req.header("X-Request-Id") ?? randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}
export function auth(req: Request, _res: Response, next: NextFunction) {
  if (
    req.path.endsWith("/auth/login") ||
    req.path.endsWith("/health") ||
    req.path.endsWith("/health/db")
  )
    return next();
  const value = req.header("Authorization") ?? parseCookie(req.header("Cookie"), "accessToken");
  if (!value?.startsWith("Bearer "))
    return next(new ApiError(401, "UNAUTHORIZED", "Thiếu access token"));
  try {
    req.storeId = verifyToken(value.slice(7)).storeId;
    next();
  } catch {
    next(
      new ApiError(
        401,
        "INVALID_TOKEN",
        "Access token không hợp lệ hoặc đã hết hạn",
      ),
    );
  }
}

function parseCookie(header: string | undefined, name: string) {
  const value = header?.split(";").find((part) => part.trim().startsWith(`${name}=`));
  return value ? `Bearer ${decodeURIComponent(value.trim().slice(name.length + 1))}` : undefined;
}
export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "NOT_FOUND", "Không tìm thấy endpoint"));
}
export function errors(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const e =
    error instanceof ApiError
      ? error
      : new ApiError(500, "INTERNAL_ERROR", "Lỗi máy chủ nội bộ");
  if (!(error instanceof ApiError))
    console.error({ requestId: req.requestId, error });
  res.status(e.status).json({ error: { code: e.code, message: e.message } });
}
