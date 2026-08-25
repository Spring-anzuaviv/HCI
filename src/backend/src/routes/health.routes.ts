import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "backend",
  });
});

healthRouter.get("/health/db", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    response.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});
