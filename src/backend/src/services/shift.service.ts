import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
export const listEmployees = (storeId: number) =>
  prisma.employee.findMany({ where: { storeId }, orderBy: { name: "asc" } });
export const listShifts = (storeId: number, date?: string) =>
  prisma.workShift.findMany({
    where: { storeId, ...(date ? { workDate: new Date(date) } : {}) },
    include: { employees: { include: { employee: true } } },
    orderBy: { startAt: "asc" },
  });
export async function assign(
  storeId: number,
  shiftId: number,
  employeeId: number,
) {
  const [shift, employee] = await Promise.all([
    prisma.workShift.findFirst({ where: { shiftId, storeId } }),
    prisma.employee.findFirst({ where: { employeeId, storeId } }),
  ]);
  if (!shift || !employee)
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy ca hoặc nhân viên");
  return prisma.employeeWorkShift.upsert({
    where: { employeeId_shiftId: { employeeId, shiftId } },
    update: {},
    create: { employeeId, shiftId },
  });
}
