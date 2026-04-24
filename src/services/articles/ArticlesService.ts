import { eq } from "drizzle-orm";
import { articlesDb } from "../../db";
import { lessons } from "../../db/articles-schema";
import { CreateArticleBody, UpdateArticleBody } from "../../validators/articles.validators";

const parseLesson = (lesson: typeof lessons.$inferSelect) => ({
  ...lesson,
  capitulos_de_pasaje: lesson.capitulosDePasaje ? JSON.parse(lesson.capitulosDePasaje) : [],
  versiculos_de_pasaje: lesson.versiculosDePasaje ? JSON.parse(lesson.versiculosDePasaje) : [],
  sections: lesson.sections ? JSON.parse(lesson.sections) : [],
  quiz: lesson.quiz ? JSON.parse(lesson.quiz) : []
});

export class ArticlesService {
  createArticle(payload: CreateArticleBody) {
    const values: typeof lessons.$inferInsert = {
      slug: payload.slug.trim().toLowerCase(),
      serie: payload.serie,
      temaSerie: payload.tema_serie,
      facilitador: payload.facilitador,
      libroDePasaje: payload.libro_de_pasaje,
      tituloDeEnsenanza: payload.titulo_de_ensenanza,
      textoNbla: payload.texto_nbla,
      textoNestleadam: payload.texto_nestleadam,
      capitulosDePasaje: JSON.stringify(payload.capitulos_de_pasaje),
      versiculosDePasaje: JSON.stringify(payload.versiculos_de_pasaje),
      sections: JSON.stringify(payload.sections),
      quiz: JSON.stringify(payload.quiz)
    };
    const inserted = articlesDb
      .insert(lessons)
      .values(values)
      .returning()
      .get();
    return parseLesson(inserted);
  }

  retrieveArticleById(id: number) {
    const found = articlesDb.select().from(lessons).where(eq(lessons.id, id)).get();
    if (!found) {
      return null;
    }
    return parseLesson(found);
  }

  retrieveArticleBySlug(slug: string) {
    const normalizedSlug = slug.trim().toLowerCase();
    const found = articlesDb.select().from(lessons).where(eq(lessons.slug, normalizedSlug)).get();
    if (!found) {
      return null;
    }
    return parseLesson(found);
  }

  /**
   * True if no row uses this slug, or the only row is `excludeId` (for edits).
   */
  isSlugAvailable(slug: string, excludeId?: number): boolean {
    const normalizedSlug = slug.trim().toLowerCase();
    if (!normalizedSlug) {
      return false;
    }
    const found = articlesDb.select().from(lessons).where(eq(lessons.slug, normalizedSlug)).get();
    if (!found) {
      return true;
    }
    if (excludeId !== undefined && found.id === excludeId) {
      return true;
    }
    return false;
  }

  retrieveArticles() {
    return articlesDb.select().from(lessons).all().map(parseLesson);
  }

  updateArticle(id: number, payload: UpdateArticleBody) {
    const updateValues: Partial<typeof lessons.$inferInsert> = {};
    if (payload.slug !== undefined) updateValues.slug = payload.slug.trim().toLowerCase();
    if (payload.serie !== undefined) updateValues.serie = payload.serie;
    if (payload.tema_serie !== undefined) updateValues.temaSerie = payload.tema_serie;
    if (payload.facilitador !== undefined) updateValues.facilitador = payload.facilitador;
    if (payload.libro_de_pasaje !== undefined) updateValues.libroDePasaje = payload.libro_de_pasaje;
    if (payload.titulo_de_ensenanza !== undefined) updateValues.tituloDeEnsenanza = payload.titulo_de_ensenanza;
    if (payload.texto_nbla !== undefined) updateValues.textoNbla = payload.texto_nbla;
    if (payload.texto_nestleadam !== undefined) updateValues.textoNestleadam = payload.texto_nestleadam;
    if (payload.capitulos_de_pasaje !== undefined) {
      updateValues.capitulosDePasaje = JSON.stringify(payload.capitulos_de_pasaje);
    }
    if (payload.versiculos_de_pasaje !== undefined) {
      updateValues.versiculosDePasaje = JSON.stringify(payload.versiculos_de_pasaje);
    }
    if (payload.sections !== undefined) updateValues.sections = JSON.stringify(payload.sections);
    if (payload.quiz !== undefined) updateValues.quiz = JSON.stringify(payload.quiz);

    const updated = articlesDb
      .update(lessons)
      .set(updateValues)
      .where(eq(lessons.id, id))
      .returning()
      .get();

    if (!updated) {
      return null;
    }

    return parseLesson(updated);
  }

  deleteArticle(id: number): boolean {
    const result = articlesDb.delete(lessons).where(eq(lessons.id, id)).run();
    return result.changes > 0;
  }
}
