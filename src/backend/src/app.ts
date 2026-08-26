import cors from "cors";
import express from "express";
import { apiRouter } from "./routes/index.js";
import { auth, errors, notFound, requestId } from "./middleware.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(requestId);
app.use(auth);
app.use("/api", apiRouter);
app.use(notFound);
app.use(errors);
