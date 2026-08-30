import { Router } from "express";
import * as controller from "../controllers/expedite.controller.js";
export const expediteRouter = Router();
expediteRouter.post("/orders/:orderId/expedite", controller.expedite);
expediteRouter.post("/orders/:orderId/expedite/confirm", controller.confirm);
