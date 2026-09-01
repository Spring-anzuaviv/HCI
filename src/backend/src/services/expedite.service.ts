import { prisma } from "../lib/prisma.js";
import { ApiError } from "../lib/http.js";
import { activeStatuses, findOrderForStore } from "./order.service.js";
import { refreshStoreSchedule } from "./order.service.js";
import { generateSchedule, checkDeadlineFeasibility } from "./scheduling.service.js";
import {
  createSimulationToken,
  evaluateScheduleImpact,
  hasBlockingExpediteImpact,
  hasExpediteImpact,
  isDeadlineBeforeEstimate,
  getExpediteOrderIds,
  getSimulationDataProblems,
} from "./expedite-workflow.js";

async function legacyCheck(orderId: number, storeId: number, newPickupAt: string) {
  const order = await findOrderForStore(orderId, storeId);
  const pickupAt = new Date(newPickupAt);
  if (Number.isNaN(pickupAt.getTime()) || pickupAt <= new Date())
    throw new ApiError(400, "VALIDATION_ERROR", "Giờ lấy mới không hợp lệ");
  const [orders, machines] = await Promise.all([
    prisma.laundryOrder.findMany({
      where: { storeId },
      include: { stages: { include: { machine: true } } },
    }),
    prisma.machine.findMany({ where: { storeId } }),
  ]);
  const simulatedOrders = orders.map((item) =>
    item.orderId === orderId || (order.groupCode && item.groupCode === order.groupCode)
      ? { ...item, pickupAt }
      : item,
  );
  const schedule = generateSchedule(simulatedOrders, machines);
  const simulated = schedule.find((item) => item.orderId === orderId);
  if (!simulated) throw new ApiError(409, "SCHEDULE_CONFLICT", "Không thể mô phỏng lịch");
  const feasibility = checkDeadlineFeasibility(simulated.estimatedAt, pickupAt);
  return {
    orderId,
    feasibility: feasibility.result,
    newEstimatedAt: simulated.estimatedAt,
    groupETA: simulated.groupETA,
    affectedOrders: schedule
      .filter((item) => item.orderId !== orderId)
      .map((item) => ({ orderId: item.orderId, estimatedAt: item.estimatedAt, groupETA: item.groupETA })),
    reason:
      feasibility.result === "FEASIBLE"
        ? "Lịch mô phỏng vẫn đáp ứng giờ hẹn"
        : feasibility.result === "AT_RISK"
          ? "Lịch mô phỏng sát giờ hẹn"
          : "Lịch mô phỏng không đáp ứng giờ hẹn",
  };
}

async function legacyApply(orderId: number, storeId: number, newPickupAt: string) {
  const order = await findOrderForStore(orderId, storeId);
  const pickupAt = new Date(newPickupAt);
  if (Number.isNaN(pickupAt.getTime()) || pickupAt <= new Date())
    throw new ApiError(400, "VALIDATION_ERROR", "Giờ lấy mới không hợp lệ");
  await prisma.laundryOrder.updateMany({
    where: { storeId, ...(order.groupCode ? { groupCode: order.groupCode } : { orderId }) },
    data: { pickupAt },
  });
  await refreshStoreSchedule(storeId);
  return findOrderForStore(orderId, storeId);
}

void legacyCheck;
void legacyApply;

async function loadActiveState(storeId: number, db: any = prisma) {
  const [orders, machines] = await Promise.all([
    db.laundryOrder.findMany({
      where: { storeId, status: { in: [...activeStatuses] } },
      include: {
        customer: true,
        stages: { include: { machine: true }, orderBy: { orderStageId: "asc" } },
      },
      orderBy: { orderId: "asc" },
    }),
    db.machine.findMany({ where: { storeId }, orderBy: { machineId: "asc" } }),
  ]);
  return { orders, machines };
}

function validatePickupChange(order: any, newPickupAt: string, now = new Date()) {
  const pickupAt = new Date(newPickupAt);
  if (Number.isNaN(pickupAt.getTime()) || pickupAt <= now)
    throw new ApiError(400, "VALIDATION_ERROR", "Giờ lấy mới phải ở tương lai (sau thời điểm hiện tại)");
  if (!order.pickupAt)
    throw new ApiError(409, "SIMULATION_DATA_INCOMPLETE", "Dữ liệu không đầy đủ để mô phỏng: đơn thiếu pickupAt");
  // Không yêu cầu newPickupAt phải sớm hơn pickupAt cũ —
  // "Đôn đơn" cho phép thay đổi giờ hẹn theo bất kỳ hướng nào miễn là > now.
  return pickupAt;
}

function simulateExpedite(
  orderId: number,
  orders: any[],
  machines: any[],
  pickupAt: Date,
  now: Date,
) {
  const problems = getSimulationDataProblems(orders, machines);
  if (problems.length > 0)
    throw new ApiError(
      409,
      "SIMULATION_DATA_INCOMPLETE",
      `Dữ liệu không đầy đủ để mô phỏng: ${problems.join("; ")}`,
    );
  const expediteOrderIds = getExpediteOrderIds(orders, orderId);
  const isTargetGroupOrder = (order: any) => expediteOrderIds.has(order.orderId);
  const simulatedOrders = orders.map((order) =>
    isTargetGroupOrder(order) ? { ...order, pickupAt } : order
  );
  let schedule: any[];
  try {
    schedule = generateSchedule(simulatedOrders, machines, now);
  } catch (error) {
    if (error instanceof ApiError)
      throw new ApiError(409, "SIMULATION_FAILED", `Không thể mô phỏng lịch: ${error.message}`);
    throw error;
  }
  const scheduleByOrderId = new Map(schedule.map((item) => [item.orderId, item]));
  const impactRows = orders
    .map((order) => {
      const simulated = scheduleByOrderId.get(order.orderId);
      if (!simulated) return null;
      const proposedPickupAt = order.orderId === orderId ? pickupAt : order.pickupAt;
      const current = evaluateScheduleImpact(order.estimatedAt, order.pickupAt);
      const proposed = evaluateScheduleImpact(simulated.estimatedAt, proposedPickupAt);
      const currentEstimatedTime = order.estimatedAt?.getTime?.() ?? null;
      const simulatedEstimatedTime = simulated.estimatedAt?.getTime?.() ?? null;
      const isTarget = order.orderId === orderId;
      if (!hasExpediteImpact(
        order.estimatedAt,
        simulated.estimatedAt,
        current.impact,
        proposed.impact,
        isTarget || isTargetGroupOrder(order),
      ))
        return null;
      return {
        orderId: order.orderId,
        customer: order.customer
          ? { name: order.customer.name, phone: order.customer.phone }
          : null,
        isTarget,
        isSameGroup: isTargetGroupOrder(order) && !isTarget,
        currentPickupAt: order.pickupAt,
        proposedPickupAt,
        currentEstimatedAt: order.estimatedAt,
        simulatedEstimatedAt: simulated.estimatedAt,
        etaDeltaMinutes:
          currentEstimatedTime === null || simulatedEstimatedTime === null
            ? null
            : Math.round((simulatedEstimatedTime - currentEstimatedTime) / 60_000),
        currentImpact: current.impact,
        currentSlackMinutes: current.slackMinutes,
        proposedImpact: proposed.impact,
        proposedSlackMinutes: proposed.slackMinutes,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const targetImpact = impactRows.find((item) => item.orderId === orderId);
  const targetDeadlineTooEarly = Boolean(
    targetImpact && isDeadlineBeforeEstimate(targetImpact.simulatedEstimatedAt, targetImpact.proposedPickupAt),
  );
  const impacts = impactRows.filter((item) => !(item.isTarget && targetDeadlineTooEarly));
  return { schedule, impacts, targetImpact, targetDeadlineTooEarly };
}

export async function check(orderId: number, storeId: number, newPickupAt: string) {
  const now = new Date();
  const { orders, machines } = await loadActiveState(storeId);
  const order = orders.find((item: any) => item.orderId === orderId);
  if (!order) {
    // Kiểm tra xem đơn có tồn tại không — phân biệt COMPLETED/READY vs không tồn tại
    const found = await prisma.laundryOrder.findFirst({ where: { orderId, storeId } });
    if (!found)
      throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng trong cửa hàng");
    if (found.status === "COMPLETED" || found.status === "READY" || found.status === "NOTIFIED")
      throw new ApiError(409, "ORDER_COMPLETED", "Đơn đã sẵn sàng lấy hoặc hoàn tất, không thể thay đổi giờ lấy");
    throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng đang hoạt động");
  }
  // Chặn thêm cho đơn READY/NOTIFIED/COMPLETED (phòng trường hợp activeStatuses thay đổi)
  if (["COMPLETED", "READY", "NOTIFIED"].includes(order.status))
    throw new ApiError(409, "ORDER_COMPLETED", "Đơn đã sẵn sàng lấy hoặc hoàn tất, không thể thay đổi giờ lấy");
  const pickupAt = validatePickupChange(order, newPickupAt, now);
  const simulation = simulateExpedite(orderId, orders, machines, pickupAt, now);
  const targetImpact = simulation.targetImpact!;
  const blockingImpacts = simulation.impacts.filter(hasBlockingExpediteImpact);
  return {
    orderId,
    currentPickupAt: order.pickupAt,
    newPickupAt: pickupAt,
    simulationToken: createSimulationToken(orders, machines, orderId, pickupAt),
    targetImpact,
    impacts: simulation.impacts,
    blockingImpacts,
    canConfirm: targetImpact.proposedImpact === "ON_TIME" && blockingImpacts.length === 0,
    targetDeadlineTooEarly: simulation.targetDeadlineTooEarly,
    summary: {
      affectedOrders: simulation.impacts.length,
      onTimeOrders: simulation.impacts.filter((item) => item.proposedImpact === "ON_TIME").length,
      atRiskOrders: simulation.impacts.filter((item) => item.proposedImpact === "AT_RISK").length,
      notFeasibleOrders: simulation.impacts.filter((item) => item.proposedImpact === "NOT_FEASIBLE").length,
      blockingOrders: blockingImpacts.length,
    },
    feasibility: targetImpact.proposedImpact,
    newEstimatedAt: targetImpact.simulatedEstimatedAt,
    reason:
      targetImpact.proposedImpact === "ON_TIME"
        ? "Lịch mô phỏng vẫn đáp ứng giờ hẹn"
        : targetImpact.proposedImpact === "AT_RISK"
          ? "Lịch mô phỏng sát giờ hẹn"
          : "Lịch mô phỏng không đáp ứng giờ hẹn",
  };
}

export async function apply(
  orderId: number,
  storeId: number,
  newPickupAt: string,
  reason: string,
  simulationToken: string,
) {
  if (!reason?.trim())
    throw new ApiError(400, "VALIDATION_ERROR", "Vui lòng nhập lý do đôn đơn");
  if (!simulationToken?.trim())
    throw new ApiError(400, "VALIDATION_ERROR", "Thiếu mã xác nhận mô phỏng");
  const now = new Date();
  const pickupValue = new Date(newPickupAt);
  if (Number.isNaN(pickupValue.getTime()))
    throw new ApiError(400, "VALIDATION_ERROR", "Giờ lấy mới không hợp lệ");

  await prisma.$transaction(async (tx) => {
    const { orders, machines } = await loadActiveState(storeId, tx);
    const order = orders.find((item: any) => item.orderId === orderId);
    if (!order) {
      const found = await tx.laundryOrder.findFirst({ where: { orderId, storeId } });
      if (!found)
        throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng trong cửa hàng");
      if (found.status === "COMPLETED" || found.status === "READY" || found.status === "NOTIFIED")
        throw new ApiError(409, "ORDER_COMPLETED", "Đơn đã sẵn sàng lấy hoặc hoàn tất, không thể thay đổi giờ lấy");
      throw new ApiError(404, "NOT_FOUND", "Không tìm thấy đơn hàng đang hoạt động");
    }
    // Kiểm tra thêm trạng thái trong transaction (phòng race condition)
    if (["COMPLETED", "READY", "NOTIFIED"].includes(order.status))
      throw new ApiError(409, "ORDER_COMPLETED", "Đơn đã sẵn sàng lấy hoặc hoàn tất, không thể thay đổi giờ lấy");
    const pickupAt = validatePickupChange(order, newPickupAt, now);
    const currentToken = createSimulationToken(orders, machines, orderId, pickupAt);
    if (currentToken !== simulationToken)
      throw new ApiError(409, "QUEUE_CHANGED", "Hàng đợi đã thay đổi, cần mô phỏng lại trước khi xác nhận");
    const simulation = simulateExpedite(orderId, orders, machines, pickupAt, now);
    const targetImpact = simulation.targetImpact;
    if (!targetImpact || targetImpact.proposedImpact !== "ON_TIME")
      throw new ApiError(409, "EXPEDITE_NOT_FEASIBLE", "Giờ hẹn mới vẫn không đảm bảo đơn được đôn đúng giờ");
    const blockingImpacts = simulation.impacts.filter(hasBlockingExpediteImpact);
    if (blockingImpacts.length > 0)
      throw new ApiError(409, "EXPEDITE_WOULD_DELAY_ORDERS", "Không thể đôn vì sẽ làm đơn khác trễ hẹn");
    const updated = await tx.laundryOrder.updateMany({
      where: {
        storeId,
        ...(order.groupCode ? { groupCode: order.groupCode } : { orderId }),
        status: { notIn: ["COMPLETED", "READY", "NOTIFIED"] },
      },
      data: { pickupAt },
    });
    const expectedUpdatedCount = order.groupCode
      ? orders.filter((item: any) => item.groupCode === order.groupCode).length
      : 1;
    if (updated.count !== expectedUpdatedCount)
      throw new ApiError(409, "ORDER_COMPLETED", "Đơn đã sẵn sàng lấy hoặc hoàn tất, không thể thay đổi giờ lấy");
  }, { isolationLevel: "Serializable" });

  await refreshStoreSchedule(storeId);
  return findOrderForStore(orderId, storeId);
}
