import { Router } from "express";
import { ArticlesController } from "../controllers/articles.controller";
import { authenticate } from "../middleware/authenticate";
import { validateRequestBody } from "../middleware/validateRequest";
import { ArticlesService } from "../services/articles/ArticlesService";
import { createArticleSchema, updateArticleSchema } from "../validators/articles.validators";

const articlesService = new ArticlesService();
const articlesController = new ArticlesController(articlesService);

export const articlesRouter = Router();

articlesRouter.get("/public/articles/:slug", articlesController.retrievePublicArticleBySlug);
articlesRouter.get(
  "/public/articles/by-path/:seriesSlug/:authorSlug/:articleSlug",
  articlesController.retrievePublicArticleByPath
);
articlesRouter.get("/public/series", articlesController.retrievePublicSeries);
articlesRouter.get("/public/series/:seriesSlug/authors", articlesController.retrievePublicSeriesAuthors);
articlesRouter.get(
  "/public/series/:seriesSlug/authors/:authorSlug/articles",
  articlesController.retrievePublicAuthorArticles
);

articlesRouter.get("/check-slug", articlesController.checkSlugAvailability);

articlesRouter.post("/create-article", authenticate, validateRequestBody(createArticleSchema), articlesController.createArticle);
articlesRouter.get("/retrieve-article/:id", articlesController.retrieveArticleById);
articlesRouter.get("/retrieve-articles", articlesController.retrieveArticles);
articlesRouter.put("/update-article/:id", authenticate, validateRequestBody(updateArticleSchema), articlesController.updateArticle);
articlesRouter.delete("/delete-article/:id", authenticate, articlesController.deleteArticle);
