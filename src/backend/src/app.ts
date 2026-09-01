import cors from "cors";
import express from "express";
import { apiRouter } from "./routes/index.js";
import { auth, errors, notFound, requestId } from "./middleware.js";
import { env } from "./config/env.js";

export const app = express();
// Bật ETag để browser có thể cache GET responses — nếu data không đổi, trả 304 thay vì 200
app.set("etag", "weak");
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(requestId);
app.use(auth);
app.use("/api", apiRouter);
app.use(notFound);
app.use(errors);

