import { z } from "zod";

const mediaSchema = z.object({
  mediaType: z.enum(["image", "video", "audio", "link"]),
  mediaUrl: z.string().url().trim(),
  mediaTitle: z.string().min(1).max(120).trim(),
  mediaDescription: z.string().min(1).max(400).trim()
});

const sectionSchema = z.object({
  sectionOrder: z.number().int().min(1),
  sectionTitle: z.string().min(1).max(180).trim(),
  sectionBody: z.string().min(1).trim(),
  multimedia: z.array(mediaSchema).min(1)
});

const quizOptionSchema = z.object({
  optionId: z.string().min(1).max(30).trim(),
  optionText: z.string().min(1).max(300).trim()
});

const quizQuestionSchema = z.object({
  questionOrder: z.number().int().min(1),
  questionPrompt: z.string().min(1).max(600).trim(),
  options: z.array(quizOptionSchema).min(2).max(8),
  correctOptionId: z.string().min(1).max(30).trim(),
  rationale: z.string().min(1).max(800).trim()
});

const lessonPayloadSchema = z.object({
  serie: z.string().min(1).max(180).trim(),
  facilitador: z.string().min(1).max(180).trim(),
  libro_de_pasaje: z.string().min(1).max(180).trim(),
  titulo_de_ensenanza: z.string().min(1).max(220).trim(),
  texto_nbla: z.string().min(1).trim(),
  texto_nestleadam: z.string().min(1).trim(),
  capitulos_de_pasaje: z.array(z.number().int().min(1)),
  versiculos_de_pasaje: z.array(z.number().int().min(1)),
  sections: z.array(sectionSchema).min(1),
  quiz: z.array(quizQuestionSchema).min(1)
});

export const createArticleSchema = lessonPayloadSchema;
export const updateArticleSchema = lessonPayloadSchema.partial();

export type CreateArticleBody = z.infer<typeof createArticleSchema>;
export type UpdateArticleBody = z.infer<typeof updateArticleSchema>;
