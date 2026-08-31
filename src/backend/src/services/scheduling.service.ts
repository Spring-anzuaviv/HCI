import { ApiError } from "../lib/http.js";

export const stageDurations = {
  SORTING: 5,
  TRANSFER: 5,
  PACKING: 10,
} as const;
export const bufferMinutes = 5;
export const workflows: Record<string, string[]> = {
  WASH: ["SORTING", "WASH", "PACKING"],
  DRY: ["SORTING", "DRY", "PACKING"],
  WASH_DRY: ["SORTING", "WASH", "TRANSFER", "DRY", "PACKING"],
};

export type ScheduleStage = {
  orderId: number;
  stage: string;
  machineId?: number | null;
  plannedStartAt: Date | null;
  plannedEndAt: Date | null;
  actualStartedAt?: Date | null;
  actualEndedAt?: Date | null;
  status: string;
};

const minutes = (value: Date, amount: number) =>
  new Date(value.getTime() + amount * 60_000);

export function getWorkflowStages(serviceType: string) {
  const result = workflows[serviceType];
  if (!result)
    throw new ApiError(400, "VALIDATION_ERROR", "Loại dịch vụ không hợp lệ");
  return result;
}

export function requiredMachineType(stage: string) {
  if (stage === "WASH") return "WASHER";
  if (stage === "DRY") return "DRYER";
  return null;
}

export function getStageDuration(stage: string, machine?: any) {
  if (stage === "WASH" || stage === "DRY") {
    if (!machine) throw new ApiError(409, "SCHEDULE_CONFLICT", "Stage cần máy");
    return machine.processingMinutes;
  }
  return stageDurations[stage as keyof typeof stageDurations] ?? 0;
}

export function findCompatibleMachines(order: any, stage: string, machines: any[]) {
  const type = requiredMachineType(stage);
  if (!type) return [];
  return machines.filter(
    (machine) =>
      machine.type === type &&
      machine.capacityKg >= Number(order.weightKg) &&
      !["BROKEN", "INACTIVE"].includes(machine.status),
  );
}

function intervalFor(stage: any, machine: any) {
  if (stage.status === "RUNNING" && stage.actualStartedAt)
    return {
      start: stage.actualStartedAt,
      end: minutes(stage.actualStartedAt, machine.processingMinutes),
    };
  if (
    stage.status === "PLANNED" &&
    stage.plannedStartAt &&
    stage.plannedEndAt
  )
    return { start: stage.plannedStartAt, end: stage.plannedEndAt };
  return null;
}

export function findEarliestAvailableSlot(
  order: any,
  stageName: string,
  machines: any[],
  stages: any[],
  earliestStart: Date,
) {
  const candidates = findCompatibleMachines(order, stageName, machines);
  const duration = getStageDuration(stageName, candidates[0]);
  const options = candidates.map((machine) => {
    const intervals = stages
      .filter((stage) => stage.machineId === machine.machineId)
      .map((stage) => intervalFor(stage, machine))
      .filter(Boolean)
      .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());
    let start = new Date(Math.max(earliestStart.getTime(), new Date().getTime()));
    for (const interval of intervals as any[]) {
      if (interval.end <= start) continue;
      if (minutes(start, duration) <= interval.start) break;
      start = new Date(interval.end);
    }
    return {
      machineId: machine.machineId,
      plannedStartAt: start,
      plannedEndAt: minutes(start, duration),
    };
  });
  options.sort(
    (a, b) =>
      a.plannedEndAt.getTime() - b.plannedEndAt.getTime() ||
      a.machineId - b.machineId,
  );
  if (!options[0])
    throw new ApiError(409, "SCHEDULE_CONFLICT", "Không có máy phù hợp");
  return options[0];
}

function stageEnd(stage: any, machine: any, now: Date) {
  if (stage.status === "COMPLETED" && stage.actualEndedAt)
    return stage.actualEndedAt;
  if (stage.status === "RUNNING" && stage.actualStartedAt)
    return minutes(stage.actualStartedAt, getStageDuration(stage.stage, machine));
  if (stage.status === "PLANNED" && stage.plannedEndAt) return stage.plannedEndAt;
  return now;
}

export function calculateETA(order: any, orderStages: any[], machines: any[], allStages: any[], now = new Date()) {
  const workflow = getWorkflowStages(order.serviceType);
  let cursor = order.readyAt ?? order.createdAt ?? now;
  let lastMachineEnd = cursor;
  for (const stageName of workflow) {
    const existing = orderStages.find((stage) => stage.stage === stageName);
    const machine = existing?.machineId
      ? machines.find((item) => item.machineId === existing.machineId)
      : undefined;
    if (existing && ["COMPLETED", "RUNNING"].includes(existing.status)) {
      cursor = stageEnd(existing, machine, now);
    } else if (existing?.status === "PLANNED" && existing.plannedEndAt) {
      cursor = existing.plannedEndAt > cursor ? existing.plannedEndAt : cursor;
    } else if (requiredMachineType(stageName)) {
      const slot = findEarliestAvailableSlot(
        order,
        stageName,
        machines,
        allStages,
        cursor,
      );
      cursor = slot.plannedEndAt;
    } else {
      cursor = new Date(Math.max(cursor.getTime(), now.getTime()));
      cursor = minutes(cursor, getStageDuration(stageName));
    }
    if (requiredMachineType(stageName)) lastMachineEnd = cursor;
  }
  return minutes(cursor, bufferMinutes);
}

export function calculateGroupETA(orders: any[]) {
  const grouped = new Map<string, number>();
  for (const order of orders) {
    if (!order.groupCode || !order.estimatedAt) continue;
    const eta = order.estimatedAt.getTime();
    grouped.set(order.groupCode, Math.max(grouped.get(order.groupCode) ?? 0, eta));
  }
  return grouped;
}

export function checkDeadlineFeasibility(estimatedAt: Date | null, pickupAt: Date | null, thresholdMinutes = 15) {
  if (!estimatedAt || !pickupAt) return { result: "UNKNOWN", slackMinutes: null };
  const slackMinutes = Math.floor((pickupAt.getTime() - estimatedAt.getTime()) / 60_000);
  return {
    result: slackMinutes < 0 ? "NOT_FEASIBLE" : slackMinutes <= thresholdMinutes ? "AT_RISK" : "FEASIBLE",
    slackMinutes,
  };
}

export function generateSchedule(orders: any[], machines: any[], now = new Date()) {
  const schedule = orders.flatMap((order) =>
    (order.stages ?? []).map((stage: any) => ({ ...stage, orderId: order.orderId })),
  );
  const ordered = [...orders].sort(
    (a, b) =>
      (a.pickupAt?.getTime?.() ?? Infinity) - (b.pickupAt?.getTime?.() ?? Infinity) ||
      a.createdAt.getTime() - b.createdAt.getTime() ||
      a.orderId - b.orderId,
  );
  for (const order of ordered) {
    let cursor = order.readyAt ?? order.createdAt ?? now;
    for (const stage of schedule.filter((item) => item.orderId === order.orderId)) {
      if (stage.status === "COMPLETED" || stage.status === "RUNNING") {
        cursor = stageEnd(stage, machines.find((m) => m.machineId === stage.machineId), now);
        continue;
      }
      const type = requiredMachineType(stage.stage);
      if (type) {
        const slot = findEarliestAvailableSlot(order, stage.stage, machines, schedule, cursor);
        stage.machineId = slot.machineId;
        stage.plannedStartAt = slot.plannedStartAt;
        stage.plannedEndAt = slot.plannedEndAt;
        cursor = slot.plannedEndAt;
      } else {
        const start = new Date(Math.max(cursor.getTime(), now.getTime()));
        stage.plannedStartAt = start;
        stage.plannedEndAt = minutes(start, getStageDuration(stage.stage));
        cursor = stage.plannedEndAt;
      }
    }
  }
  const result = orders.map((order) => {
    const stages = schedule.filter((stage) => stage.orderId === order.orderId);
    const estimatedAt = calculateETA(order, stages, machines, schedule, now);
    return { orderId: order.orderId, stages, estimatedAt };
  });
  const etaByGroup = calculateGroupETA(
    result.map((item) => ({ ...orders.find((o) => o.orderId === item.orderId), estimatedAt: item.estimatedAt })),
  );
  return result.map((item) => ({
    ...item,
    groupETA: orders.find((o) => o.orderId === item.orderId)?.groupCode
      ? new Date(etaByGroup.get(orders.find((o) => o.orderId === item.orderId).groupCode)!)
      : item.estimatedAt,
  }));
}

export function recalculateSchedule(orders: any[], machines: any[], now = new Date()) {
  return generateSchedule(orders, machines, now);
}

export function simulateInsertion(orders: any[], machines: any[], newOrder: any, position: number) {
  const copy = [...orders];
  copy.splice(position, 0, newOrder);
  return generateSchedule(copy, machines);
}

export function findBestInsertion(orders: any[], machines: any[], newOrder: any) {
  const options = orders.map((_, index) => simulateInsertion(orders, machines, newOrder, index));
  options.push(simulateInsertion(orders, machines, newOrder, orders.length));
  const allOrders = [...orders, newOrder];
  const score = (result: any[]) => {
    let lateCount = 0;
    let totalDelay = 0;
    let newOrderETA = Infinity;
    for (const item of result) {
      const order = allOrders.find((candidate) => candidate.orderId === item.orderId);
      const deadline = order?.groupCode ? item.groupETA : order?.pickupAt;
      const delay = deadline ? Math.max(0, (item.estimatedAt.getTime() - deadline.getTime()) / 60000) : 0;
      if (delay > 0) lateCount += 1;
      totalDelay += delay;
      if (item.orderId === newOrder.orderId) newOrderETA = item.estimatedAt.getTime();
    }
    return [lateCount, totalDelay, newOrderETA];
  };
  return options.sort((a, b) => {
    const left = score(a);
    const right = score(b);
    return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
  })[0] ?? generateSchedule([newOrder], machines);
}

export function getWorkQueue(orders: any[], machines: any[], now = new Date()) {
  const schedule = generateSchedule(orders, machines, now);
  return schedule
    .flatMap((item) => item.stages.map((stage: any) => ({ ...stage, estimatedAt: item.estimatedAt, groupETA: item.groupETA })))
    .filter((stage) => stage.status === "PLANNED" && stage.machineId)
    .sort((a, b) => (a.plannedStartAt?.getTime?.() ?? Infinity) - (b.plannedStartAt?.getTime?.() ?? Infinity));
}
