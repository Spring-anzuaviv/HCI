import { prisma } from "../lib/prisma.js";
import { verifyPassword, signToken } from "../lib/auth.js";
import { ApiError } from "../lib/http.js";

export async function login(email: string, password: string) {
  const store = await prisma.store.findUnique({ where: { email } });
  if (!store || !verifyPassword(password, store.passwordHash))
    throw new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "Email hoặc mật khẩu không đúng",
    );
  return {
    accessToken: signToken({
      sub: String(store.storeId),
      storeId: store.storeId,
    }),
    tokenType: "Bearer",
    expiresIn: "8h",
    store: { storeId: store.storeId, name: store.name, email: store.email },
  };
}
export async function currentStore(storeId: number) {
  const store = await prisma.store.findUnique({
    where: { storeId },
    select: { storeId: true, name: true, address: true, email: true },
  });
  if (!store) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy cửa hàng");
  return store;
}
