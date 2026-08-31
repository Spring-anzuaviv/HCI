import { Router } from "express";
import * as controller from "../controllers/machine.controller.js";
export const machineRouter = Router();
machineRouter.get("/stores/:storeId/machines", controller.list);
machineRouter.get("/machines/:machineId", controller.detail);
machineRouter.patch("/machines/:machineId/status", controller.markOutOfService);
machineRouter.post("/orders/:orderId/stages/:stage/start", controller.startRun);
machineRouter.patch(
  "/order-stages/:orderStageId/complete",
  controller.completeRun,
);
