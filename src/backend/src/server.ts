import { app } from "./app.js";
import { env } from "./config/env.js";
import { disconnectPrisma } from "./lib/prisma.js";
import { startScheduleJob } from "./services/schedule-job.js";

const server = app.listen(env.port, () => {
  console.log(`Backend đang chạy tại http://localhost:${env.port}`);
});
const stopScheduleJob = startScheduleJob();

async function shutdown(signal: string) {
  console.log(`Nhận ${signal}, đang đóng server...`);
  stopScheduleJob();

  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
