import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(128).trim()
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(128).trim()
});

export const resetPasswordSchema = z.object({
  email: z.string().email().trim().toLowerCase()
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
