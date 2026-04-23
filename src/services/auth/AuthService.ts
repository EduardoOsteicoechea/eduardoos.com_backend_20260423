import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { authDb } from "../../db";
import { refreshTokens, users } from "../../db/auth-schema";
import { IEmailService } from "../../interfaces/IEmailService";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { hashPassword, verifyPassword } from "../../utils/password";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

export class AuthService {
  constructor(private readonly emailService: IEmailService) {}

  async register(email: string, password: string): Promise<SessionTokens> {
    const existing = authDb.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      throw new Error("Email already registered");
    }

    const createdUser = authDb
      .insert(users)
      .values({ email, passwordHash: hashPassword(password) })
      .returning()
      .get();

    return this.createSessionTokens(createdUser.id, createdUser.email);
  }

  async login(email: string, password: string): Promise<SessionTokens> {
    const found = authDb.select().from(users).where(eq(users.email, email)).get();
    if (!found || !verifyPassword(password, found.passwordHash)) {
      throw new Error("Invalid credentials");
    }
    return this.createSessionTokens(found.id, found.email);
  }

  async logout(refreshToken: string): Promise<void> {
    authDb.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.token, refreshToken)).run();
  }

  async refreshSession(oldRefreshToken: string): Promise<SessionTokens> {
    const payload = verifyRefreshToken(oldRefreshToken);
    const tokenRow = authDb
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, oldRefreshToken))
      .get();

    if (!tokenRow || tokenRow.revoked) {
      throw new Error("Refresh token revoked");
    }

    const now = new Date();
    const expiresAt = new Date(tokenRow.expiresAt);
    if (expiresAt < now) {
      throw new Error("Refresh token expired");
    }

    authDb
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, tokenRow.id))
      .run();

    return this.createSessionTokens(Number(payload.sub), payload.email);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const found = authDb.select().from(users).where(eq(users.email, email)).get();
    if (!found) {
      return;
    }
    const resetToken = randomUUID();
    await this.emailService.sendPasswordResetToken(email, resetToken);
  }

  getProfile(userId: number): { id: number; email: string; createdAt: string } {
    const found = authDb.select().from(users).where(eq(users.id, userId)).get();
    if (!found) {
      throw new Error("User not found");
    }
    return { id: found.id, email: found.email, createdAt: found.createdAt };
  }

  private createSessionTokens(userId: number, email: string): SessionTokens {
    const accessToken = signAccessToken({ sub: String(userId), email });
    const refreshToken = signRefreshToken({ sub: String(userId), email });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    authDb.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt,
      revoked: false
    }).run();

    return { accessToken, refreshToken };
  }
}
