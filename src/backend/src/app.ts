import cors from "cors";
import express from "express";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Không tìm thấy endpoint" });
});

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: "Lỗi máy chủ nội bộ" });
});
