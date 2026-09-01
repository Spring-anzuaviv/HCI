import assert from "node:assert/strict";
import test from "node:test";
import {
  compareSmartQueuePriority,
  evaluateQueueRisk,
} from "./smart-queue.js";
import {
  calculateCompletionTiming,
  nextOrderStatusAfterStage,
} from "./machine-workflow.js";
import { getWorkflowStages, requiredMachineType } from "./scheduling.service.js";
import { collapseNotificationGroups } from "./notification.service.js";
import {
  getExpediteOrderIds,
  hasBlockingExpediteImpact,
  hasExpediteImpact,
  isDeadlineBeforeEstimate,
} from "./expedite-workflow.js";
import { buildQueueSnapshot } from "./queue.service.js";

test("workflow dịch vụ giữ đúng thứ tự công đoạn", () => {
  assert.deepEqual(getWorkflowStages("WASH_DRY"), ["SORTING", "WASH", "TRANSFER", "DRY", "PACKING"]);
  assert.equal(requiredMachineType("WASH"), "WASHER");
  assert.equal(requiredMachineType("PACKING"), null);
});

test("đánh giá nguy cơ ưu tiên đơn dự kiến trễ", () => {
  const now = new Date("2026-09-01T08:00:00.000Z");
  const late = evaluateQueueRisk(
    new Date("2026-09-01T09:00:00.000Z"),
    new Date("2026-09-01T09:20:00.000Z"),
    now,
  );
  const safe = evaluateQueueRisk(
    new Date("2026-09-01T10:00:00.000Z"),
    new Date("2026-09-01T09:00:00.000Z"),
    now,
  );
  assert.equal(late.riskLevel, "NOT_FEASIBLE");
  assert.equal(safe.riskLevel, "FEASIBLE");
  assert.ok(compareSmartQueuePriority(
    { ...late, pickupAt: new Date("2026-09-01T09:00:00.000Z"), createdAt: now, orderId: 1 },
    { ...safe, pickupAt: new Date("2026-09-01T10:00:00.000Z"), createdAt: now, orderId: 2 },
  ) < 0);
});

test("thời gian máy và trạng thái kế tiếp được tính xác định", () => {
  const timing = calculateCompletionTiming(
    30,
    new Date("2026-09-01T08:00:00.000Z"),
    new Date("2026-09-01T08:31:00.000Z"),
  );
  assert.equal(timing.completionDue, true);
  assert.equal(timing.timeLeft, 0);
  assert.equal(nextOrderStatusAfterStage("WASH", "WASH_DRY"), "WAITING");
  assert.equal(nextOrderStatusAfterStage("PACKING", "WASH_DRY"), "READY");
});

test("đơn tách chỉ tạo một card thông báo cho cả nhóm", () => {
  const cards = collapseNotificationGroups([
    { orderId: 40, groupCode: "GROUP-KHANH-THY", status: "READY" },
    { orderId: 39, groupCode: "GROUP-KHANH-THY", status: "READY" },
    { orderId: 41, groupCode: null, status: "READY" },
  ]);

  assert.equal(cards.length, 2);
  assert.equal(cards[0].orderId, 39);
  assert.equal(cards[0].groupCount, 2);
  assert.deepEqual(cards[0].orderIds, [39, 40]);
  assert.equal(cards[1].groupCount, 1);
});

test("chỉ phân biệt đơn bị thay đổi bởi lần dời, không tính đơn vốn đã trễ", () => {
  assert.equal(hasExpediteImpact(
    new Date("2026-09-01T09:20:00.000Z"),
    new Date("2026-09-01T09:20:00.000Z"),
    "NOT_FEASIBLE",
    "NOT_FEASIBLE",
    false,
  ), false);
  assert.equal(hasExpediteImpact(
    new Date("2026-09-01T09:00:00.000Z"),
    new Date("2026-09-01T09:20:00.000Z"),
    "ON_TIME",
    "NOT_FEASIBLE",
    false,
  ), true);
});

test("không cho đôn nếu lần dời làm đơn khác trễ hẹn", () => {
  assert.equal(hasBlockingExpediteImpact({
    isTarget: false,
    currentImpact: "ON_TIME",
    proposedImpact: "NOT_FEASIBLE",
  }), true);
  assert.equal(hasBlockingExpediteImpact({
    isTarget: false,
    currentImpact: "NOT_FEASIBLE",
    proposedImpact: "NOT_FEASIBLE",
  }), true);
  assert.equal(hasBlockingExpediteImpact({
    isTarget: false,
    currentImpact: "ON_TIME",
    proposedImpact: "AT_RISK",
  }), false);
});

test("giờ hẹn sớm hơn ETA được cảnh báo riêng, không phải đơn bị ảnh hưởng", () => {
  assert.equal(isDeadlineBeforeEstimate(
    new Date("2026-09-01T10:00:00.000Z"),
    new Date("2026-09-01T09:45:00.000Z"),
  ), true);
  assert.equal(isDeadlineBeforeEstimate(
    new Date("2026-09-01T10:00:00.000Z"),
    new Date("2026-09-01T10:00:00.000Z"),
  ), false);
});

test("đôn một mẻ áp dụng cho toàn bộ đơn cùng nhóm", () => {
  const orders = [
    { orderId: 10, groupCode: "GROUP-10" },
    { orderId: 11, groupCode: "GROUP-10" },
    { orderId: 12, groupCode: null },
  ];
  assert.deepEqual([...getExpediteOrderIds(orders, 10)], [10, 11]);
  assert.deepEqual([...getExpediteOrderIds(orders, 12)], [12]);
});

test("đơn mới chỉ trễ phân loại sau khi hết thời lượng phân loại", () => {
  const createdAt = new Date("2026-09-01T08:00:00.000Z");
  const stages = [
    { orderStageId: 1, stage: "SORTING", status: "PLANNED", plannedStartAt: createdAt, plannedEndAt: new Date("2026-09-01T08:05:00.000Z"), machineId: null },
    { orderStageId: 2, stage: "WASH", status: "PLANNED", plannedStartAt: new Date("2026-09-01T08:05:00.000Z"), plannedEndAt: new Date("2026-09-01T08:35:00.000Z"), machineId: 1 },
    { orderStageId: 3, stage: "PACKING", status: "PLANNED", plannedStartAt: new Date("2026-09-01T08:35:00.000Z"), plannedEndAt: new Date("2026-09-01T08:45:00.000Z"), machineId: null },
  ];
  const order = { orderId: 80, status: "RECEIVED", serviceType: "WASH", weightKg: 3, createdAt, readyAt: createdAt, pickupAt: new Date("2026-09-01T10:00:00.000Z"), estimatedAt: new Date("2026-09-01T08:50:00.000Z"), stages };
  const beforeEnd = buildQueueSnapshot([order], [], [], new Date("2026-09-01T08:04:00.000Z")).items[0];
  const afterEnd = buildQueueSnapshot([order], [], [], new Date("2026-09-01T08:07:00.000Z")).items[0];
  assert.equal(beforeEnd.taskDelayMinutes, 0);
  assert.equal(afterEnd.taskDelayMinutes, 2);
  assert.equal(afterEnd.taskDeadlineAt?.toISOString(), "2026-09-01T08:05:00.000Z");
});
