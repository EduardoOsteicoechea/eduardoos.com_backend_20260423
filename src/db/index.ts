import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as authSchema from "./auth-schema";
import * as articlesSchema from "./articles-schema";

const dataDirectory = path.resolve(process.cwd(), "data");
fs.mkdirSync(dataDirectory, { recursive: true });
const authDbPath = path.resolve(dataDirectory, "auth.db");
const articlesDbPath = path.resolve(dataDirectory, "articles.db");

export const authSqlite = new Database(authDbPath);
export const articlesSqlite = new Database(articlesDbPath);

authSqlite.pragma("journal_mode = WAL");
articlesSqlite.pragma("journal_mode = WAL");

export const authDb = drizzleSqlite(authSqlite, { schema: authSchema });
export const articlesDb = drizzleSqlite(articlesSqlite, { schema: articlesSchema });
