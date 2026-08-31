import { Router } from "express";
import * as controller from "../controllers/store.controller.js";
export const storeRouter = Router();
storeRouter.get("/stores/:storeId/dashboard", controller.dashboard);
storeRouter.post("/stores/:storeId/deadline-check", controller.deadlineCheck);
storeRouter.post("/stores/:storeId/deadline-group-check", controller.deadlineGroupCheck);
storeRouter.get("/stores/:storeId/stats", controller.stats);
storeRouter.get("/stores/:storeId/shift-summary", controller.shiftSummary);
storeRouter.patch("/stores/:storeId", controller.updateName);
