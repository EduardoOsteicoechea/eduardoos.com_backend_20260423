import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { articlesRouter } from "./routes/articles.routes";
import { lessonRouter } from "./routes/lesson.routes";
import { paymentRouter } from "./routes/payment.routes";

export const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(
  cors({
    origin: [
      env.frontendUrl,
      "http://localhost:1424",
      "http://localhost:1425",
      "http://localhost:5173",
      "http://localhost:4173",
      "https://eduardoos.com",
      "https://www.eduardoos.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
  })
);
app.use(cookieParser());

app.use("/api", authRouter);
app.use("/api", articlesRouter);
app.use("/api", lessonRouter);
app.use(paymentRouter);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});
