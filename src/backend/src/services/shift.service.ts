import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
export const listEmployees = (storeId: number) =>
  prisma.employee.findMany({ where: { storeId }, orderBy: { name: "asc" } });
export async function createEmployee(storeId: number, input: { name: string; phone?: string; role?: string }) {
  if (input.phone?.trim() && await prisma.employee.findFirst({ where: { storeId, phone: input.phone.trim() } })) throw new ApiError(409, "VALIDATION_ERROR", "Số điện thoại nhân viên đã tồn tại");
  return prisma.employee.create({ data: { storeId, name: input.name.trim(), phone: input.phone?.trim() ?? "", role: input.role ?? "STAFF" } });
}
export async function updateEmployee(employeeId: number, storeId: number, input: { name?: string; phone?: string; role?: string }) {
  const employee = await prisma.employee.findFirst({ where: { employeeId, storeId } });
  if (!employee) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy nhân viên");
  if (input.phone?.trim() && await prisma.employee.findFirst({ where: { storeId, phone: input.phone.trim(), employeeId: { not: employeeId } } })) throw new ApiError(409, "VALIDATION_ERROR", "Số điện thoại nhân viên đã tồn tại");
  return prisma.employee.update({ where: { employeeId }, data: { ...(input.name !== undefined ? { name: input.name.trim() } : {}), ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}), ...(input.role !== undefined ? { role: input.role } : {}) } });
}
export async function deleteEmployee(employeeId: number, storeId: number) {
  const employee = await prisma.employee.findFirst({ where: { employeeId, storeId }, include: { shifts: true } });
  if (!employee) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy nhân viên");
  if (employee.shifts.length) throw new ApiError(409, "WORKFLOW_CONFLICT", "Hãy hủy phân ca trước khi xóa nhân viên");
  await prisma.employee.delete({ where: { employeeId } });
  return { deleted: true };
}
export async function listShifts(storeId: number, date?: string) {
  if (date) {
    const workDate = new Date(`${date}T00:00:00.000Z`);
    const existing = await findShifts(storeId, workDate);
    if (existing.length) return existing;

    // Each date has its own assignments. Clone only the shift time templates,
    // never the employees, when a new work date is opened for the first time.
    const template = await prisma.workShift.findFirst({
      where: { storeId },
      orderBy: [{ workDate: "desc" }, { startAt: "asc" }],
    });
    if (!template) return [];
    const templates = await prisma.workShift.findMany({ where: { storeId, workDate: template.workDate }, orderBy: { startAt: "asc" } });
    await prisma.$transaction(templates.map(item => prisma.workShift.create({
      data: {
        storeId, name: item.name, workDate,
        startAt: atDate(workDate, item.startAt),
        endAt: atDate(workDate, item.endAt),
      },
    })));
    return findShifts(storeId, workDate);
  }
  return findShifts(storeId);
}

function findShifts(storeId: number, workDate?: Date) {
  return prisma.workShift.findMany({
    where: { storeId, ...(workDate ? { workDate } : {}) },
    include: { employees: { include: { employee: true } } },
    orderBy: { startAt: "asc" },
  });
}

function atDate(date: Date, value: Date) {
  const result = new Date(date);
  result.setUTCHours(value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds(), value.getUTCMilliseconds());
  return result;
}
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
export async function unassign(storeId: number, shiftId: number, employeeId: number) {
  const assignment = await prisma.employeeWorkShift.findFirst({ where: { shiftId, employeeId, shift: { storeId } } });
  if (!assignment) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy phân ca");
  await prisma.employeeWorkShift.delete({ where: { employeeId_shiftId: { employeeId, shiftId } } });
  return { deleted: true };
}
