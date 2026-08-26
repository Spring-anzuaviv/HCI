import { Router } from "express";
import { expedite } from "../controllers/expedite.controller.js";
export const expediteRouter = Router();
expediteRouter.post("/orders/:orderId/expedite", expedite);
