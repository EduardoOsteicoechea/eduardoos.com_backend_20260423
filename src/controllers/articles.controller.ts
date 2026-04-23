import { Request, Response } from "express";
import { ArticlesService } from "../services/articles/ArticlesService";
import { CreateArticleBody, UpdateArticleBody } from "../validators/articles.validators";

export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  createArticle = (request: Request<unknown, unknown, CreateArticleBody>, response: Response): void => {
    const article = this.articlesService.createArticle(request.body);
    response.status(201).json(article);
  };

  retrieveArticleById = (request: Request<{ id: string }>, response: Response): void => {
    const article = this.articlesService.retrieveArticleById(Number(request.params.id));
    if (!article) {
      response.status(404).json({ message: "Article not found" });
      return;
    }
    response.status(200).json(article);
  };

  retrieveArticles = (_request: Request, response: Response): void => {
    const articles = this.articlesService.retrieveArticles();
    response.status(200).json(articles);
  };

  updateArticle = (
    request: Request<{ id: string }, unknown, UpdateArticleBody>,
    response: Response
  ): void => {
    const article = this.articlesService.updateArticle(Number(request.params.id), request.body);
    if (!article) {
      response.status(404).json({ message: "Article not found" });
      return;
    }
    response.status(200).json(article);
  };

  deleteArticle = (request: Request<{ id: string }>, response: Response): void => {
    const wasDeleted = this.articlesService.deleteArticle(Number(request.params.id));
    if (!wasDeleted) {
      response.status(404).json({ message: "Article not found" });
      return;
    }
    response.status(200).json({ message: "Article deleted" });
  };
}
