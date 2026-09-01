import { createHash } from "node:crypto";
import { checkDeadlineFeasibility, getWorkflowStages } from "./scheduling.service.js";

export type ExpediteImpact = "ON_TIME" | "AT_RISK" | "NOT_FEASIBLE" | "UNKNOWN";

export function getExpediteOrderIds(orders: any[], orderId: number) {
  const target = orders.find((order) => order.orderId === orderId);
  if (!target) return new Set<number>();
  return new Set(
    orders
      .filter((order) => order.orderId === orderId || (target.groupCode && order.groupCode === target.groupCode))
      .map((order) => order.orderId),
  );
}

function asDate(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function evaluateScheduleImpact(estimatedValue: unknown, pickupValue: unknown) {
  const estimatedAt = asDate(estimatedValue);
  const pickupAt = asDate(pickupValue);
  const result = checkDeadlineFeasibility(estimatedAt, pickupAt);
  return {
    impact: (result.result === "FEASIBLE" ? "ON_TIME" : result.result) as ExpediteImpact,
    slackMinutes: result.slackMinutes,
  };
}

export function isDeadlineBeforeEstimate(estimateValue: unknown, deadlineValue: unknown) {
  const estimateAt = asDate(estimateValue);
  const deadlineAt = asDate(deadlineValue);
  return Boolean(estimateAt && deadlineAt && deadlineAt < estimateAt);
}

export function hasExpediteImpact(
  currentEstimatedValue: unknown,
  simulatedEstimatedValue: unknown,
  currentImpact: ExpediteImpact,
  proposedImpact: ExpediteImpact,
  isTarget: boolean,
) {
  if (isTarget) return true;
  const currentEstimatedAt = asDate(currentEstimatedValue);
  const simulatedEstimatedAt = asDate(simulatedEstimatedValue);
  const etaChanged = currentEstimatedAt?.getTime() !== simulatedEstimatedAt?.getTime();
  return etaChanged || currentImpact !== proposedImpact;
}

export function hasBlockingExpediteImpact(impact: {
  isTarget: boolean;
  currentImpact: ExpediteImpact;
  proposedImpact: ExpediteImpact;
}) {
  return !impact.isTarget
    && impact.proposedImpact === "NOT_FEASIBLE";
}

function normalizedDate(value: unknown) {
  return asDate(value)?.toISOString() ?? null;
}

export function getSimulationDataProblems(orders: any[], machines: any[]) {
  const problems: string[] = [];
  if (machines.length === 0) problems.push("Cửa hàng chưa có dữ liệu máy");
  for (const machine of machines) {
    if (!Number.isFinite(Number(machine.processingMinutes)) || Number(machine.processingMinutes) <= 0)
      problems.push(`Máy ${machine.machineId} thiếu thời gian xử lý hợp lệ`);
  }
  for (const order of orders) {
    if (!asDate(order.pickupAt)) problems.push(`Đơn #${order.orderId} thiếu pickupAt`);
    let workflow: string[] = [];
    try {
      workflow = getWorkflowStages(order.serviceType);
    } catch {
      problems.push(`Đơn #${order.orderId} có loại dịch vụ không hợp lệ`);
    }
    for (const stageName of workflow) {
      if (!(order.stages ?? []).some((stage: any) => stage.stage === stageName))
        problems.push(`Đơn #${order.orderId} thiếu công đoạn ${stageName}`);
    }
  }
  return [...new Set(problems)];
}

export function createSimulationToken(
  orders: any[],
  machines: any[],
  orderId: number,
  newPickupAt: Date,
) {
  const snapshot = {
    orderId,
    newPickupAt: newPickupAt.toISOString(),
    orders: [...orders]
      .sort((left, right) => left.orderId - right.orderId)
      .map((order) => ({
        orderId: order.orderId,
        status: order.status,
        serviceType: order.serviceType,
        weightKg: Number(order.weightKg),
        readyAt: normalizedDate(order.readyAt),
        pickupAt: normalizedDate(order.pickupAt),
        estimatedAt: normalizedDate(order.estimatedAt),
        createdAt: normalizedDate(order.createdAt),
        stages: [...(order.stages ?? [])]
          .sort((left: any, right: any) => left.orderStageId - right.orderStageId)
          .map((stage: any) => ({
            orderStageId: stage.orderStageId,
            machineId: stage.machineId ?? null,
            stage: stage.stage,
            status: stage.status,
            plannedStartAt: normalizedDate(stage.plannedStartAt),
            plannedEndAt: normalizedDate(stage.plannedEndAt),
            actualStartedAt: normalizedDate(stage.actualStartedAt),
            actualEndedAt: normalizedDate(stage.actualEndedAt),
          })),
      })),
    machines: [...machines]
      .sort((left, right) => left.machineId - right.machineId)
      .map((machine) => ({
        machineId: machine.machineId,
        status: machine.status,
        type: machine.type,
        capacityKg: Number(machine.capacityKg),
        processingMinutes: Number(machine.processingMinutes),
      })),
  };
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}
