import { promises as fs } from "node:fs";
import path from "node:path";
import { articlesDb } from "../src/db";
import { lessons } from "../src/db/articles-schema";

type StaticLessonJson = {
  serie?: unknown;
  facilitador?: unknown;
  libro_de_pasaje?: unknown;
  titulo_de_enseñanza?: unknown;
  titulo_de_ensenanza?: unknown;
  texto_nbla?: unknown;
  texto_nestleadam?: unknown;
  capitulos_de_pasaje?: unknown;
  versiculos_de_pasaje?: unknown;
  sections?: unknown;
  quiz?: unknown;
};

const staticSeriesRoot = path.resolve(
  process.cwd(),
  "..",
  "frontend",
  "static",
  "biblia",
  "series"
);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | null => (typeof value === "string" ? value : null);

const asNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is number => typeof item === "number");
};

const readJsonFilesRecursively = async (directoryPath: string): Promise<string[]> => {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readJsonFilesRecursively(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name === "data.json") {
      files.push(fullPath);
    }
  }

  return files;
};

const getSlugsFromDataJsonPath = (dataJsonPath: string) => {
  const relativePath = path.relative(staticSeriesRoot, dataJsonPath);
  const parts = relativePath.split(path.sep);

  if (parts.length !== 4 || parts[3] !== "data.json") {
    throw new Error(
      `Expected path format "<series>/<author>/<article>/data.json", got "${relativePath}".`
    );
  }

  const [seriesSlug, authorSlug, articleSlug] = parts;
  return {
    seriesSlug: seriesSlug.toLowerCase(),
    authorSlug: authorSlug.toLowerCase(),
    articleSlug: articleSlug.toLowerCase()
  };
};

async function seedBibliaArticles(): Promise<void> {
  const dataJsonFiles = await readJsonFilesRecursively(staticSeriesRoot);
  let seededCount = 0;

  for (const dataJsonPath of dataJsonFiles) {
    const { seriesSlug, authorSlug, articleSlug } = getSlugsFromDataJsonPath(dataJsonPath);
    const routePath = `biblia/series/${seriesSlug}/${authorSlug}/${articleSlug}`;
    const slug = `${seriesSlug}-${authorSlug}-${articleSlug}`;

    const raw = await fs.readFile(dataJsonPath, "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(
        `Invalid JSON in "${dataJsonPath}": ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (!isPlainObject(parsed)) {
      throw new Error(`Unexpected payload in "${dataJsonPath}": expected a JSON object.`);
    }

    const lesson = parsed as StaticLessonJson;
    const normalizedSerie = asString(lesson.serie) ?? seriesSlug;
    const normalizedFacilitador = asString(lesson.facilitador) ?? "";
    const normalizedLibro = asString(lesson.libro_de_pasaje) ?? "";
    const normalizedTitulo =
      asString(lesson.titulo_de_ensenanza) ?? asString(lesson.titulo_de_enseñanza) ?? articleSlug;
    const normalizedTextoNbla = asString(lesson.texto_nbla) ?? "";
    const normalizedTextoNestleadam = asString(lesson.texto_nestleadam) ?? "";
    const normalizedCapitulos = asNumberArray(lesson.capitulos_de_pasaje);
    const normalizedVersiculos = asNumberArray(lesson.versiculos_de_pasaje);
    const normalizedSections = Array.isArray(lesson.sections) ? lesson.sections : [];
    const normalizedQuiz = Array.isArray(lesson.quiz) ? lesson.quiz : [];

    articlesDb
      .insert(lessons)
      .values({
        slug,
        seriesSlug,
        authorSlug,
        articleSlug,
        routePath,
        serie: normalizedSerie,
        facilitador: normalizedFacilitador,
        libroDePasaje: normalizedLibro,
        tituloDeEnsenanza: normalizedTitulo,
        textoNbla: normalizedTextoNbla,
        textoNestleadam: normalizedTextoNestleadam,
        capitulosDePasaje: JSON.stringify(normalizedCapitulos),
        versiculosDePasaje: JSON.stringify(normalizedVersiculos),
        sections: JSON.stringify(normalizedSections),
        quiz: JSON.stringify(normalizedQuiz)
      })
      .onConflictDoUpdate({
        target: lessons.routePath,
        set: {
          slug,
          seriesSlug,
          authorSlug,
          articleSlug,
          routePath,
          serie: normalizedSerie,
          facilitador: normalizedFacilitador,
          libroDePasaje: normalizedLibro,
          tituloDeEnsenanza: normalizedTitulo,
          textoNbla: normalizedTextoNbla,
          textoNestleadam: normalizedTextoNestleadam,
          capitulosDePasaje: JSON.stringify(normalizedCapitulos),
          versiculosDePasaje: JSON.stringify(normalizedVersiculos),
          sections: JSON.stringify(normalizedSections),
          quiz: JSON.stringify(normalizedQuiz)
        }
      })
      .run();

    seededCount += 1;
  }

  console.log(`Seeded/updated ${seededCount} biblia article(s) into articles.db`);
}

void seedBibliaArticles().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
