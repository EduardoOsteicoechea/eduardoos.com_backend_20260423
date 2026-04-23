import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { validateRequestBody } from "../middleware/validateRequest";
import { AuthService } from "../services/auth/AuthService";
import { MockEmailProviderService } from "../services/email/MockEmailProviderService";
import { loginSchema, registerSchema, resetPasswordSchema } from "../validators/auth.validators";

const authService = new AuthService(new MockEmailProviderService());
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", validateRequestBody(registerSchema), authController.register);
authRouter.post("/login", validateRequestBody(loginSchema), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/reset-password", validateRequestBody(resetPasswordSchema), authController.resetPassword);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.get("/profile", authenticate, authController.profile);
