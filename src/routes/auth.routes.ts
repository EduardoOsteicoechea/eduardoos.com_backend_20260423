import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { validateRequestBody } from "../middleware/validateRequest";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema
} from "../validators/auth.validators";

const authController = new AuthController();

export const authRouter = Router();

authRouter.post("/auth/login", validateRequestBody(loginSchema), authController.login);
authRouter.post(
  "/auth/forgot-password",
  validateRequestBody(forgotPasswordSchema),
  authController.forgotPassword
);
authRouter.post(
  "/auth/reset-password",
  validateRequestBody(resetPasswordSchema),
  authController.resetPassword
);
authRouter.post("/auth/refresh-token", authController.refreshToken);
authRouter.get("/profile", authenticate, authController.profile);
