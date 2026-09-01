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
