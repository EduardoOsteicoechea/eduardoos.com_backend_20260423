import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle/articles",
  schema: "./src/db/articles-schema.ts",
  dbCredentials: {
    url: "./data/articles.db"
  }
});
