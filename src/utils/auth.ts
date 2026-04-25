import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const DEFAULT_LOCAL_JWT_SECRET = "local-dev-jwt-secret-change-me";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_LOCAL_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export type AuthTokenPayload = {
  sub: string;
  username: string;
};

export const hashPassword = async (rawPassword: string): Promise<string> =>
  bcrypt.hash(rawPassword, BCRYPT_ROUNDS);

export const comparePassword = async (
  rawPassword: string,
  passwordHash: string
): Promise<boolean> => bcrypt.compare(rawPassword, passwordHash);

export const signJwt = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

export const verifyJwt = (token: string): AuthTokenPayload =>
  jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
