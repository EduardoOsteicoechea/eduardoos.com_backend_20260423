import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(64).trim().toLowerCase(),
  password: z.string().min(8).max(128).trim()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().trim().toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256).trim(),
  newPassword: z.string().min(8).max(128).trim()
});

export type LoginBody = z.infer<typeof loginSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
