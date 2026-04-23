import fs from "node:fs";
import path from "node:path";
import { authSqlite, articlesSqlite } from "./index";

const rawLessonsSql = `
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serie TEXT,
    facilitador TEXT,
    libro_de_pasaje TEXT,
    titulo_de_ensenanza TEXT,
    texto_nbla TEXT,
    texto_nestleadam TEXT,
    capitulos_de_pasaje TEXT CHECK(json_valid(capitulos_de_pasaje)),
    versiculos_de_pasaje TEXT CHECK(json_valid(versiculos_de_pasaje)),
    sections TEXT CHECK(json_valid(sections)),
    quiz TEXT CHECK(json_valid(quiz))
);
`;

export const initializeDatabases = (): void => {
  const dataDir = path.resolve(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  authSqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0
    );
  `);

  articlesSqlite.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    articlesSqlite.exec(rawLessonsSql);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("already exists")) {
      throw error;
    }
  }
};

if (require.main === module) {
  initializeDatabases();
  console.log("Databases initialized successfully.");
}
