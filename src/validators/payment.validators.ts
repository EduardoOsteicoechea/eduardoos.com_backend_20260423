import { z } from "zod";

export const createOrderSchema = z.object({
  amount: z.number().positive(),
  currencyCode: z.string().length(3).trim().toUpperCase()
});

export const captureOrderSchema = z.object({
  orderId: z.string().min(1).trim()
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type CaptureOrderBody = z.infer<typeof captureOrderSchema>;
