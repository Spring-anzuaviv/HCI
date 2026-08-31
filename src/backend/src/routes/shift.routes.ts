import { Router } from "express";
import * as controller from "../controllers/shift.controller.js";
export const shiftRouter = Router();
shiftRouter.get("/stores/:storeId/employees", controller.employees);
shiftRouter.post("/stores/:storeId/employees", controller.createEmployee);
shiftRouter.patch("/employees/:employeeId", controller.updateEmployee);
shiftRouter.delete("/employees/:employeeId", controller.deleteEmployee);
shiftRouter.get("/stores/:storeId/shifts", controller.shifts);
shiftRouter.post(
  "/stores/:storeId/shifts/:shiftId/assignments",
  controller.assign,
);
shiftRouter.delete("/stores/:storeId/shifts/:shiftId/assignments/:employeeId", controller.unassign);
