import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import { env } from "../config/env";

type JwtPayloadBase = {
  sub: string;
  email: string;
};

export const signAccessToken = (payload: JwtPayloadBase): string =>
  jwt.sign(payload, env.accessTokenSecret, { expiresIn: env.accessTokenTtl as StringValue });

export const signRefreshToken = (payload: JwtPayloadBase): string =>
  jwt.sign(payload, env.refreshTokenSecret, { expiresIn: env.refreshTokenTtl as StringValue });

export const verifyAccessToken = (token: string): JwtPayloadBase =>
  jwt.verify(token, env.accessTokenSecret) as JwtPayloadBase;

export const verifyRefreshToken = (token: string): JwtPayloadBase =>
  jwt.verify(token, env.refreshTokenSecret) as JwtPayloadBase;
