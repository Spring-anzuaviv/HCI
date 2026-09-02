import { prisma } from "../lib/prisma.js";
import { activeStatuses, rescheduleLateOrder } from "./order.service.js";
import { isStageOverdue } from "./scheduling.service.js";

const INTERVAL_MS = 60_000;

function overdueMinutes(order: { stages: Array<{ stage: string; plannedStartAt: Date | null; plannedEndAt: Date | null }> }, now: Date) {
  return Math.max(
    0,
    ...order.stages
      .filter((stage) => isStageOverdue(stage, now))
      .map((stage) => {
        const deadline = ["WASH", "DRY"].includes(stage.stage)
          ? stage.plannedStartAt
          : stage.plannedEndAt;
        return deadline ? (now.getTime() - deadline.getTime()) / 60_000 : 0;
      }),
  );
}

export function startScheduleJob() {
  let running = false;
  const run = async () => {
    if (running) return;
    const startedAt = Date.now();
    running = true;
    try {
      const stores = await prisma.store.findMany({ select: { storeId: true } });
      console.info(`[schedule-job] Bắt đầu quét ${stores.length} cửa hàng`);
      for (const store of stores) {
        const scanNow = new Date();
        const orders = await prisma.laundryOrder.findMany({
          where: { storeId: store.storeId, status: { in: [...activeStatuses] } },
          select: {
            orderId: true,
            pickupAt: true,
            createdAt: true,
            stages: { select: { stage: true, status: true, plannedStartAt: true, plannedEndAt: true } },
          },
        });
        const overdueOrderIds = orders
          .filter((order) => order.stages.some((stage) => isStageOverdue(stage, scanNow)))
          .sort((left, right) =>
            (left.pickupAt?.getTime() ?? Number.POSITIVE_INFINITY) - (right.pickupAt?.getTime() ?? Number.POSITIVE_INFINITY)
            || overdueMinutes(right, scanNow) - overdueMinutes(left, scanNow)
            || left.createdAt.getTime() - right.createdAt.getTime()
            || left.orderId - right.orderId,
          )
          .map((order) => order.orderId);
        for (const orderId of overdueOrderIds) {
          const result = await rescheduleLateOrder(store.storeId, orderId, scanNow);
          if (result.status === "RESCHEDULED") {
            const changedStage = result.stages.find((stage) => stage.stage === result.previousStage);
            console.info(
              `[schedule-job] Đơn #${orderId}: đã dời ${result.previousStage} `
              + `${result.previousStartAt?.toISOString() ?? "--"} -> ${changedStage?.plannedStartAt?.toISOString() ?? "--"}; `
              + `ETA ${result.estimatedAt.toISOString()} (hẹn ${result.pickupAt?.toISOString() ?? "--"})`,
            );
          } else if (result.status === "NOT_FEASIBLE") {
            console.info(`[schedule-job] Đơn #${orderId}: không dời lịch, ETA mới không đáp ứng giờ hẹn ${result.pickupAt?.toISOString() ?? "--"}`);
          } else {
            console.info(`[schedule-job] Đơn #${orderId}: không còn stage PLANNED quá hạn`);
          }
        }
        if (overdueOrderIds.length === 0) {
          console.info(`[schedule-job] Cửa hàng #${store.storeId}: không có đơn PLANNED quá hạn`);
        }
      }
      console.info(`[schedule-job] Hoàn tất sau ${Date.now() - startedAt}ms`);
    } catch (error) {
      console.error(`[schedule-job] Lỗi sau ${Date.now() - startedAt}ms:`, error);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void run(), INTERVAL_MS);
  timer.unref();
  void run();
  return () => clearInterval(timer);
}
