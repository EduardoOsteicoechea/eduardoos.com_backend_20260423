import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  orderId: text("order_id").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull(),
  amount: real("amount").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").unique(),
  seriesSlug: text("series_slug"),
  authorSlug: text("author_slug"),
  articleSlug: text("article_slug"),
  routePath: text("route_path").unique(),
  serie: text("serie"),
  temaSerie: text("tema_serie"),
  facilitador: text("facilitador"),
  libroDePasaje: text("libro_de_pasaje"),
  tituloDeEnsenanza: text("titulo_de_ensenanza"),
  textoNbla: text("texto_nbla"),
  textoNestleadam: text("texto_nestleadam"),
  capitulosDePasaje: text("capitulos_de_pasaje"),
  versiculosDePasaje: text("versiculos_de_pasaje"),
  sections: text("sections"),
  quiz: text("quiz")
});
