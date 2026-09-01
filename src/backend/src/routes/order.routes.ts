import { Router } from "express";
import * as controller from "../controllers/order.controller.js";
export const orderRouter = Router();
orderRouter.get("/stores/:storeId/orders", controller.list);
orderRouter.post("/stores/:storeId/orders/batch", controller.createBatch);
orderRouter.post("/stores/:storeId/orders", controller.create);
orderRouter.get("/orders/:orderId", controller.get);
orderRouter.patch("/orders/:orderId/status", controller.updateStatus);
