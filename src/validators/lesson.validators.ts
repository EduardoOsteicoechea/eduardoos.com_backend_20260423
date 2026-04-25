import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(1).max(180).trim(),
  content: z.string().min(1).trim()
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(180).trim().optional(),
  content: z.string().min(1).trim().optional()
});

export type CreateLessonBody = z.infer<typeof createLessonSchema>;
export type UpdateLessonBody = z.infer<typeof updateLessonSchema>;
