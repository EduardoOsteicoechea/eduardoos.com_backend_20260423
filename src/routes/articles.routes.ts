import { Router } from "express";
import { ArticlesController } from "../controllers/articles.controller";
import { authenticate } from "../middleware/authenticate";
import { validateRequestBody } from "../middleware/validateRequest";
import { ArticlesService } from "../services/articles/ArticlesService";
import { createArticleSchema, updateArticleSchema } from "../validators/articles.validators";

const articlesService = new ArticlesService();
const articlesController = new ArticlesController(articlesService);

export const articlesRouter = Router();

articlesRouter.post("/create-article", authenticate, validateRequestBody(createArticleSchema), articlesController.createArticle);
articlesRouter.get("/retrieve-article/:id", authenticate, articlesController.retrieveArticleById);
articlesRouter.get("/retrieve-articles", authenticate, articlesController.retrieveArticles);
articlesRouter.put("/update-article/:id", authenticate, validateRequestBody(updateArticleSchema), articlesController.updateArticle);
articlesRouter.delete("/delete-article/:id", authenticate, articlesController.deleteArticle);
