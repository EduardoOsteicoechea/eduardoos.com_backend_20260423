import { Request, Response } from "express";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, baseCookieOptions } from "../config/cookies";
import { AuthService } from "../services/auth/AuthService";
import { LoginBody, RegisterBody, ResetPasswordBody } from "../validators/auth.validators";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: Request<unknown, unknown, RegisterBody>, response: Response): Promise<void> => {
    try {
      const tokens = await this.authService.register(request.body.email, request.body.password);
      this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
      response.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      response.status(400).json({ message: (error as Error).message });
    }
  };

  login = async (request: Request<unknown, unknown, LoginBody>, response: Response): Promise<void> => {
    try {
      const tokens = await this.authService.login(request.body.email, request.body.password);
      this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
      response.status(200).json({ message: "Login successful" });
    } catch (error) {
      response.status(401).json({ message: (error as Error).message });
    }
  };

  logout = async (request: Request, response: Response): Promise<void> => {
    const refreshToken = request.cookies[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    response.clearCookie(ACCESS_COOKIE_NAME, baseCookieOptions);
    response.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
    response.status(200).json({ message: "Logout successful" });
  };

  refreshToken = async (request: Request, response: Response): Promise<void> => {
    try {
      const refreshToken = request.cookies[REFRESH_COOKIE_NAME];
      if (!refreshToken) {
        response.status(401).json({ message: "Missing refresh token" });
        return;
      }
      const tokens = await this.authService.refreshSession(refreshToken);
      this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
      response.status(200).json({ message: "Session refreshed" });
    } catch (error) {
      response.status(401).json({ message: (error as Error).message });
    }
  };

  resetPassword = async (
    request: Request<unknown, unknown, ResetPasswordBody>,
    response: Response
  ): Promise<void> => {
    await this.authService.requestPasswordReset(request.body.email);
    response.status(200).json({ message: "If the email exists, a reset token has been sent." });
  };

  profile = (request: Request, response: Response): void => {
    try {
      if (!request.authenticatedUser) {
        response.status(401).json({ message: "Unauthorized" });
        return;
      }
      const profile = this.authService.getProfile(request.authenticatedUser.userId);
      response.status(200).json(profile);
    } catch (error) {
      response.status(404).json({ message: (error as Error).message });
    }
  };

  private setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    response.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...baseCookieOptions,
      maxAge: 15 * 60 * 1000
    });
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }
}
