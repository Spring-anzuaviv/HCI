import { Router } from "express";
import * as controller from "../controllers/shift.controller.js";
export const shiftRouter = Router();
shiftRouter.get("/stores/:storeId/employees", controller.employees);
shiftRouter.get("/stores/:storeId/shifts", controller.shifts);
shiftRouter.post(
  "/stores/:storeId/shifts/:shiftId/assignments",
  controller.assign,
);
