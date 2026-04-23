import cookieParser from "cookie-parser";
import express from "express";
import { authRouter } from "./routes/auth.routes";
import { articlesRouter } from "./routes/articles.routes";
import { paymentRouter } from "./routes/payment.routes";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(articlesRouter);
app.use(paymentRouter);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});
