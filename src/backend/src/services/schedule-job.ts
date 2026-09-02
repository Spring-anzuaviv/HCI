import { prisma } from "../lib/prisma.js";
import { activeStatuses, rescheduleLateOrder } from "./order.service.js";
import { isStageOverdue } from "./scheduling.service.js";

const INTERVAL_MS = 60_000;

function formatVietnamTime(value: Date | null | undefined) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}

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
      console.info(`[schedule-job] Bắt đầu quét ${stores.length} cửa hàng lúc ${formatVietnamTime(new Date())}`);
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
              + `${formatVietnamTime(result.previousStartAt)} -> ${formatVietnamTime(changedStage?.plannedStartAt)}; `
              + `ETA ${formatVietnamTime(result.estimatedAt)} (hẹn ${formatVietnamTime(result.pickupAt)})`,
            );
          } else if (result.status === "NOT_FEASIBLE") {
            console.info(`[schedule-job] Đơn #${orderId}: không dời lịch, ETA mới không đáp ứng giờ hẹn ${formatVietnamTime(result.pickupAt)}`);
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
