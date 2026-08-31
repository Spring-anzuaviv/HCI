import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
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

export async function changePassword(storeId: number, currentPassword: string, newPassword: string) {
  const store = await prisma.store.findUnique({ where: { storeId } });
  if (!store || !verifyPassword(currentPassword, store.passwordHash))
    throw new ApiError(400, "VALIDATION_ERROR", "Mật khẩu hiện tại không đúng");
  if (newPassword.length < 6)
    throw new ApiError(400, "VALIDATION_ERROR", "Mật khẩu mới phải có ít nhất 6 ký tự");
  await prisma.store.update({ where: { storeId }, data: { passwordHash: hashPassword(newPassword) } });
  return { changed: true };
}
