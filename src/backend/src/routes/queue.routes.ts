import { Router } from "express";
import * as controller from "../controllers/queue.controller.js";
export const queueRouter = Router();
queueRouter.get("/stores/:storeId/queue", controller.queue);
queueRouter.post(
  "/stores/:storeId/queue/recommendation",
  controller.recommendation,
);
