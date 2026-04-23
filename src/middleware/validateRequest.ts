import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validateRequestBody =
  <T extends ZodTypeAny>(schema: T) =>
  (request: Request, response: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten()
      });
      return;
    }
    request.body = parsed.data;
    next();
  };
