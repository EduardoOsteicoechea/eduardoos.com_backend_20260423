import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle",
  schema: ["./src/db/auth-schema.ts", "./src/db/articles-schema.ts"],
  dbCredentials: {
    url: "./data/articles.db"
  }
});
