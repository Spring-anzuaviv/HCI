import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { env } from "../config/env.js";

const base64 = (value: string | Buffer) =>
  Buffer.from(value).toString("base64url");
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
export function signToken(payload: { sub: string; storeId: number }) {
  const header = base64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64(
    JSON.stringify({
      ...payload,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
    }),
  );
  const input = `${header}.${body}`;
  return `${input}.${base64(createHmac("sha256", env.jwtSecret).update(input).digest())}`;
}
export function verifyToken(token: string): {
  sub: string;
  storeId: number;
  exp: number;
  type: string;
} {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) throw new Error("invalid token");
  const input = `${header}.${body}`;
  const expected = base64(
    createHmac("sha256", env.jwtSecret).update(input).digest(),
  );
  if (signature !== expected) throw new Error("invalid signature");
  const value = JSON.parse(Buffer.from(body, "base64url").toString()) as {
    sub: string;
    storeId: number;
    exp: number;
    type: string;
  };
  if (value.type !== "access" || value.exp <= Math.floor(Date.now() / 1000))
    throw new Error("expired token");
  return value;
}
