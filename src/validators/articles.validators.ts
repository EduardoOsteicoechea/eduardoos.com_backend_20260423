import { z } from "zod";

/** Empty / null = no media; non-empty must be a valid URL. */
const optionalMediaUrl = z.preprocess(
  (val) => (val === null || val === undefined ? "" : String(val).trim()),
  z.union([z.literal(""), z.string().url()])
);

const mediaSchema = z.object({
  mediaType: z.enum(["image", "video", "audio", "link"]),
  mediaUrl: optionalMediaUrl,
  mediaTitle: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val).trim()),
    z.string().max(120)
  ),
  mediaDescription: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val).trim()),
    z.string().max(400)
  )
});

const biblicalQuoteSchema = z.object({
  reference: z.string().min(1).max(200).trim(),
  text: z.string().min(1).trim(),
  emphasized: z.array(z.string().min(1)).optional()
});

const sectionSchema = z.object({
  sectionOrder: z.number().int().min(1),
  sectionTitle: z.string().min(1).max(180).trim(),
  sectionBody: z.string().optional(),
  content: z.array(z.string().min(1)).min(1),
  biblical_quotes: z.array(biblicalQuoteSchema).optional(),
  emphasyzed_phrases: z.array(z.string().min(1)).optional(),
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

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and single hyphens.");

const lessonPayloadSchema = z.object({
  slug: slugSchema,
  serie: z.string().min(1).max(180).trim(),
  tema_serie: z.string().min(1).max(120).trim(),
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
