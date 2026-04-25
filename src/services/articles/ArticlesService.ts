import { and, eq } from "drizzle-orm";
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

const toTitleCase = (value: string): string =>
  value
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export type PublicSeriesListItem = {
  seriesSlug: string;
  seriesName: string;
  articleCount: number;
};

export type PublicSeriesAuthorListItem = {
  seriesSlug: string;
  authorSlug: string;
  authorName: string;
  articleCount: number;
};

export type PublicAuthorArticleListItem = {
  seriesSlug: string;
  authorSlug: string;
  articleSlug: string;
  articleTitle: string;
  routePath: string;
};

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

  retrieveArticleByRoutePath(seriesSlug: string, authorSlug: string, articleSlug: string) {
    const normalizedSeriesSlug = seriesSlug.trim().toLowerCase();
    const normalizedAuthorSlug = authorSlug.trim().toLowerCase();
    const normalizedArticleSlug = articleSlug.trim().toLowerCase();
    const normalizedRoutePath =
      `biblia/series/${normalizedSeriesSlug}/${normalizedAuthorSlug}/${normalizedArticleSlug}`;

    const foundByPath = articlesDb
      .select()
      .from(lessons)
      .where(eq(lessons.routePath, normalizedRoutePath))
      .get();

    if (foundByPath) {
      return parseLesson(foundByPath);
    }

    const foundByComposite = articlesDb
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.seriesSlug, normalizedSeriesSlug),
          eq(lessons.authorSlug, normalizedAuthorSlug),
          eq(lessons.articleSlug, normalizedArticleSlug)
        )
      )
      .get();

    if (!foundByComposite) {
      return null;
    }

    return parseLesson(foundByComposite);
  }

  retrievePublicSeries(): PublicSeriesListItem[] {
    const rows = articlesDb.select().from(lessons).all();
    const grouped = new Map<string, PublicSeriesListItem>();

    for (const row of rows) {
      const seriesSlug = (row.seriesSlug ?? "").trim().toLowerCase();
      if (!seriesSlug) {
        continue;
      }
      const existing = grouped.get(seriesSlug);
      if (existing) {
        existing.articleCount += 1;
        continue;
      }
      grouped.set(seriesSlug, {
        seriesSlug,
        seriesName: toTitleCase(seriesSlug),
        articleCount: 1
      });
    }

    return [...grouped.values()].sort((a, b) => a.seriesName.localeCompare(b.seriesName));
  }

  retrievePublicSeriesAuthors(seriesSlug: string): PublicSeriesAuthorListItem[] {
    const normalizedSeriesSlug = seriesSlug.trim().toLowerCase();
    const rows = articlesDb
      .select()
      .from(lessons)
      .where(eq(lessons.seriesSlug, normalizedSeriesSlug))
      .all();

    const grouped = new Map<string, PublicSeriesAuthorListItem>();

    for (const row of rows) {
      const authorSlug = (row.authorSlug ?? "").trim().toLowerCase();
      if (!authorSlug) {
        continue;
      }
      const existing = grouped.get(authorSlug);
      if (existing) {
        existing.articleCount += 1;
        continue;
      }
      grouped.set(authorSlug, {
        seriesSlug: normalizedSeriesSlug,
        authorSlug,
        authorName: toTitleCase(authorSlug),
        articleCount: 1
      });
    }

    return [...grouped.values()].sort((a, b) => a.authorName.localeCompare(b.authorName));
  }

  retrievePublicAuthorArticles(seriesSlug: string, authorSlug: string): PublicAuthorArticleListItem[] {
    const normalizedSeriesSlug = seriesSlug.trim().toLowerCase();
    const normalizedAuthorSlug = authorSlug.trim().toLowerCase();
    const rows = articlesDb
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.seriesSlug, normalizedSeriesSlug),
          eq(lessons.authorSlug, normalizedAuthorSlug)
        )
      )
      .all();

    return rows
      .map((row) => {
        const articleSlug = (row.articleSlug ?? "").trim().toLowerCase();
        const routePath =
          (row.routePath ?? "").trim() ||
          `biblia/series/${normalizedSeriesSlug}/${normalizedAuthorSlug}/${articleSlug}`;
        const articleTitle = (row.tituloDeEnsenanza ?? "").trim() || toTitleCase(articleSlug);
        return {
          seriesSlug: normalizedSeriesSlug,
          authorSlug: normalizedAuthorSlug,
          articleSlug,
          articleTitle,
          routePath
        };
      })
      .filter((item) => item.articleSlug.length > 0)
      .sort((a, b) => a.articleTitle.localeCompare(b.articleTitle));
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
