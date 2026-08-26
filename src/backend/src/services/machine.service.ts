import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { findOrderForStore } from "./order.service.js";
export async function list(storeId: number) {
  const machines = await prisma.machine.findMany({
    where: { storeId },
    include: {
      runs: {
        where: { endedAt: null },
        include: { order: true },
        orderBy: { startedAt: "desc" },
      },
    },
  });
  return machines.map((machine) => ({
    ...machine,
    timeLeft: machine.runs[0]
      ? Math.max(
          0,
          machine.processingMinutes -
            Math.floor(
              (Date.now() - machine.runs[0].startedAt.getTime()) / 60000,
            ),
        )
      : 0,
  }));
}
export async function detail(machineId: number, storeId: number) {
  const machine = await prisma.machine.findFirst({
    where: { machineId, storeId },
    include: {
      runs: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: { order: true },
      },
    },
  });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  return machine;
}
export async function startRun(orderId: number, storeId: number, input: any) {
  const order = await findOrderForStore(orderId, storeId);
  const machine = await prisma.machine.findFirst({
    where: { machineId: Number(input.machineId), storeId },
  });
  if (!machine) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy máy");
  if (Number(order.weightKg) > machine.capacityKg)
    throw new ApiError(
      409,
      "WORKFLOW_CONFLICT",
      "Khối lượng vượt sức chứa máy",
    );
  if (
    await prisma.machineRun.findFirst({
      where: { machineId: machine.machineId, endedAt: null },
    })
  )
    throw new ApiError(
      409,
      "WORKFLOW_CONFLICT",
      "Máy đang có mẻ chưa hoàn tất",
    );
  return prisma.machineRun.create({
    data: {
      orderId,
      machineId: machine.machineId,
      stage: input.stage,
      startedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
      status: "RUNNING",
    },
  });
}
export async function completeRun(
  machineRunId: number,
  storeId: number,
  endedAt?: string,
) {
  const run = await prisma.machineRun.findFirst({
    where: { machineRunId, machine: { storeId } },
  });
  if (!run) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy mẻ máy");
  if (run.endedAt)
    throw new ApiError(409, "WORKFLOW_CONFLICT", "Mẻ máy đã hoàn tất");
  return prisma.machineRun.update({
    where: { machineRunId },
    data: {
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      status: "COMPLETED",
    },
  });
}
