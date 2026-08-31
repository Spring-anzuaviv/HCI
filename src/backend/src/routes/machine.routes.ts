import { Router } from "express";
import * as controller from "../controllers/machine.controller.js";
export const machineRouter = Router();
machineRouter.get("/stores/:storeId/machines", controller.list);
machineRouter.post("/stores/:storeId/machines", controller.create);
machineRouter.get("/machines/:machineId", controller.detail);
machineRouter.patch("/machines/:machineId", controller.update);
machineRouter.delete("/machines/:machineId", controller.remove);
machineRouter.post("/orders/:orderId/stages/:stage/start", controller.startRun);
machineRouter.patch(
  "/order-stages/:orderStageId/complete",
  controller.completeRun,
);
