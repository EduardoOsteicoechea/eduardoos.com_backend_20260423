import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/auth";

export const authMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  const authorizationHeader = request.headers.authorization ?? "";
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyJwt(token);
    request.authenticatedUser = {
      userId: payload.sub,
      username: payload.username
    };
    next();
  } catch {
    response.status(401).json({ message: "Unauthorized" });
  }
};
