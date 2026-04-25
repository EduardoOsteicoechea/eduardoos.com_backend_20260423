import type { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { env } from "../config/env";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, baseCookieOptions } from "../config/cookies";
import { authDb, authSqlite } from "../db";
import { users } from "../db/auth-schema";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import type { ForgotPasswordBody, LoginBody, ResetPasswordBody } from "../validators/auth.validators";

export class AuthController {
  private readonly bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  private loginColumnName: "username" | "email" | null = null;

  private hashPassword = async (rawPassword: string): Promise<string> =>
    bcrypt.hash(rawPassword, this.bcryptRounds);

  private comparePassword = async (rawPassword: string, hashedPassword: string): Promise<boolean> =>
    bcrypt.compare(rawPassword, hashedPassword);

  private resolveLoginColumnName = (): "username" | "email" => {
    if (this.loginColumnName) {
      return this.loginColumnName;
    }

    const tableInfo = authSqlite
      .prepare("PRAGMA table_info(users)")
      .all() as Array<{ name?: string }>;
    const availableColumns = new Set(tableInfo.map((column) => column.name));

    this.loginColumnName = availableColumns.has("username") ? "username" : "email";
    return this.loginColumnName;
  };

  private findUserByLoginIdentifier = (loginIdentifier: string) => {
    const loginColumnName = this.resolveLoginColumnName();

    if (loginColumnName === "username") {
      return authDb
        .select()
        .from(users)
        .where(sql`lower(${users.username}) = ${loginIdentifier}`)
        .get();
    }

    return authSqlite
      .prepare(
        `SELECT id, email AS username, password_hash AS passwordHash, reset_password_token AS resetPasswordToken, reset_password_expires AS resetPasswordExpires, created_at AS createdAt FROM users WHERE lower(email) = ? LIMIT 1`
      )
      .get(loginIdentifier) as (typeof users.$inferSelect & { username: string }) | undefined;
  };

  private mailTransporter: nodemailer.Transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    logger: true,
    debug: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  login = async (request: Request<unknown, unknown, LoginBody>, response: Response): Promise<void> => {
    console.log("Login Attempt - Username:", request.body.username);
    const username = request.body.username.trim().toLowerCase();
    const password = request.body.password;

    const user = this.findUserByLoginIdentifier(username);
    console.log("Database User Found:", user ? "Yes" : "No");

    if (!user) {
      response.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await this.comparePassword(password, user.passwordHash);
    console.log("Password Match:", isMatch);
    if (!isMatch) {
      response.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = signAccessToken({
      sub: user.id,
      username: user.username
    });
    const refreshToken = signRefreshToken({
      sub: user.id,
      username: user.username
    });

    response.cookie(ACCESS_COOKIE_NAME, accessToken, baseCookieOptions);
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, baseCookieOptions);

    response.status(200).json({
      token: accessToken,
      user: {
        id: user.id,
        username: user.username
      }
    });
  };

  forgotPassword = async (
    request: Request<unknown, unknown, ForgotPasswordBody>,
    response: Response
  ): Promise<void> => {
    const email = request.body.email.trim().toLowerCase();
    const user = this.findUserByLoginIdentifier(email);

    // Keep response generic to avoid account enumeration.
    if (!user) {
      response.status(200).json({ message: "If the account exists, a recovery email has been sent." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    authDb
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordExpires: expiryDate
      })
      .where(eq(users.id, user.id))
      .run();

    const resetLink = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await this.mailTransporter.sendMail({
        from: env.smtpUser,
        to: user.username,
        subject: "Password reset request",
        text: `Reset your password using this link: ${resetLink}`,
        html: `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p>`
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      response.status(500).json({ message: "Failed to send password reset email." });
      return;
    }

    response.status(200).json({ message: "If the account exists, a recovery email has been sent." });
  };

  resetPassword = async (
    request: Request<unknown, unknown, ResetPasswordBody>,
    response: Response
  ): Promise<void> => {
    const token = request.body.token.trim();
    const newPassword = request.body.newPassword;
    const nowIso = new Date().toISOString();

    const user = authDb
      .select()
      .from(users)
      .where(sql`${users.resetPasswordToken} = ${token} AND ${users.resetPasswordExpires} > ${nowIso}`)
      .get();

    if (!user) {
      response.status(400).json({ message: "Reset token is invalid or expired." });
      return;
    }

    const nextPasswordHash = await this.hashPassword(newPassword);

    authDb
      .update(users)
      .set({
        passwordHash: nextPasswordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      })
      .where(eq(users.id, user.id))
      .run();

    response.status(200).json({ message: "Password updated successfully." });
  };

  refreshToken = (request: Request, response: Response): void => {
    const refreshToken = request.cookies[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      response.status(401).json({ message: "Missing refresh token" });
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = authDb.select().from(users).where(eq(users.id, payload.sub)).get();
      if (!user) {
        response.status(401).json({ message: "Invalid refresh token" });
        return;
      }

      const accessToken = signAccessToken({
        sub: user.id,
        username: user.username
      });

      response.cookie(ACCESS_COOKIE_NAME, accessToken, baseCookieOptions);
      response.status(200).json({ message: "Access token refreshed successfully." });
    } catch {
      response.status(401).json({ message: "Invalid refresh token" });
    }
  };

  profile = (request: Request, response: Response): void => {
    const authenticatedUserId: string | undefined = request.authenticatedUser?.userId;
    if (!authenticatedUserId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = authDb.select().from(users).where(eq(users.id, authenticatedUserId)).get();
    if (!user) {
      response.status(404).json({ message: "User not found" });
      return;
    }

    response.status(200).json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt
    });
  };
}
