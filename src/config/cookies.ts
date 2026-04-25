import { env } from "./env";

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

export const baseCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "strict" as const
};
