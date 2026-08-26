import { Router } from "express";
import * as controller from "../controllers/machine.controller.js";
export const machineRouter = Router();
machineRouter.get("/stores/:storeId/machines", controller.list);
machineRouter.get("/machines/:machineId", controller.detail);
machineRouter.post("/orders/:orderId/machine-runs", controller.startRun);
machineRouter.patch(
  "/machine-runs/:machineRunId/complete",
  controller.completeRun,
);
