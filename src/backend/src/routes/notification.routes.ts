import { Router } from "express";
import * as controller from "../controllers/notification.controller.js";
export const notificationRouter = Router();
notificationRouter.get(
  "/stores/:storeId/notifications/pending",
  controller.pending,
);
notificationRouter.post(
  "/orders/:orderId/notifications/preview",
  controller.preview,
);
notificationRouter.post("/orders/:orderId/notifications/send", controller.send);
notificationRouter.get(
  "/stores/:storeId/handovers/preview",
  controller.handover,
);
