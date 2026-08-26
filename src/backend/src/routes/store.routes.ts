import { Router } from "express";
import * as controller from "../controllers/store.controller.js";
export const storeRouter = Router();
storeRouter.get("/stores/:storeId/dashboard", controller.dashboard);
storeRouter.post("/stores/:storeId/deadline-check", controller.deadlineCheck);
