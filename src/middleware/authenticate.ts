import { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE_NAME } from "../config/cookies";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (request: Request, response: Response, next: NextFunction): void => {
  const accessToken = request.cookies[ACCESS_COOKIE_NAME];
  if (!accessToken) {
    response.status(401).json({ message: "Missing access token" });
    return;
  }

  try {
    const payload = verifyAccessToken(accessToken);
    request.authenticatedUser = {
      userId: payload.sub,
      username: payload.username
    };
    next();
  } catch {
    response.status(401).json({ message: "Invalid access token" });
  }
};
