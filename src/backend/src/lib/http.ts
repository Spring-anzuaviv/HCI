import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export const ok = (response: Response, data: unknown, meta?: unknown) =>
  response.json(meta === undefined ? { data } : { data, meta });

export function asyncRoute(
  handler: (req: Request, res: Response, next: NextFunction) => unknown,
) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

export function requireStore(req: Request): number {
  if (!req.storeId)
    throw new ApiError(401, "UNAUTHORIZED", "Yêu cầu đăng nhập");
  return req.storeId;
}

export function parseId(value: unknown, field: string): number {
  const id = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(id) || id <= 0)
    throw new ApiError(400, "VALIDATION_ERROR", `${field} không hợp lệ`);
  return id;
}

export function validateBody(body: unknown, fields: string[]) {
  if (!body || typeof body !== "object")
    throw new ApiError(400, "VALIDATION_ERROR", "Body phải là JSON object");
  for (const field of fields)
    if (!(field in body))
      throw new ApiError(400, "VALIDATION_ERROR", `Thiếu trường ${field}`);
}
