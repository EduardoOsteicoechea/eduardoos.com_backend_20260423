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

  checkSlugAvailability = (request: Request, response: Response): void => {
    const rawSlug = String(request.query.slug ?? "").trim().toLowerCase();
    const excludeRaw = request.query.excludeId;
    const excludeId =
      excludeRaw === undefined || excludeRaw === "" || Array.isArray(excludeRaw)
        ? undefined
        : Number(excludeRaw);
    if (!rawSlug) {
      response.status(200).json({ available: false });
      return;
    }
    const excludeNumericId = typeof excludeId === "number" && Number.isInteger(excludeId) ? excludeId : undefined;
    const available = this.articlesService.isSlugAvailable(rawSlug, excludeNumericId);
    response.status(200).json({ available });
  };

  retrievePublicArticleBySlug = (request: Request<{ slug: string }>, response: Response): void => {
    const rawSlug = request.params.slug ?? "";
    const article = this.articlesService.retrieveArticleBySlug(rawSlug);
    if (!article) {
      response.status(404).json({ message: "Article not found" });
      return;
    }
    response.status(200).json(article);
  };

  retrievePublicArticleByPath = (
    request: Request<{ seriesSlug: string; authorSlug: string; articleSlug: string }>,
    response: Response
  ): void => {
    const { seriesSlug, authorSlug, articleSlug } = request.params;
    const article = this.articlesService.retrieveArticleByRoutePath(seriesSlug, authorSlug, articleSlug);
    if (!article) {
      response.status(404).json({ message: "Article not found" });
      return;
    }
    response.status(200).json(article);
  };

  retrievePublicSeries = (_request: Request, response: Response): void => {
    const series = this.articlesService.retrievePublicSeries();
    response.status(200).json(series);
  };

  retrievePublicSeriesAuthors = (request: Request<{ seriesSlug: string }>, response: Response): void => {
    const seriesSlug = request.params.seriesSlug ?? "";
    const authors = this.articlesService.retrievePublicSeriesAuthors(seriesSlug);
    response.status(200).json(authors);
  };

  retrievePublicAuthorArticles = (
    request: Request<{ seriesSlug: string; authorSlug: string }>,
    response: Response
  ): void => {
    const { seriesSlug, authorSlug } = request.params;
    const articles = this.articlesService.retrievePublicAuthorArticles(seriesSlug, authorSlug);
    response.status(200).json(articles);
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
