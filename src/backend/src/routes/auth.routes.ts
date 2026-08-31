import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
export const authRouter = Router();
authRouter.post("/auth/login", controller.login);
authRouter.get("/auth/me", controller.me);
authRouter.post("/auth/logout", controller.logout);
authRouter.post("/auth/change-password", controller.changePassword);
