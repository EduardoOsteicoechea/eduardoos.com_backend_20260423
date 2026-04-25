import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { authDb } from "../../db";
import { users } from "../../db/auth-schema";
import { signAccessToken } from "../../utils/jwt";

export class AuthService {
  private readonly bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

  private hashPassword = async (rawPassword: string): Promise<string> =>
    bcrypt.hash(rawPassword, this.bcryptRounds);

  private comparePassword = async (rawPassword: string, hashedPassword: string): Promise<boolean> =>
    bcrypt.compare(rawPassword, hashedPassword);

  async register(username: string, password: string): Promise<{ token: string }> {
    const normalizedUsername = username.trim().toLowerCase();
    const existing = authDb.select().from(users).where(eq(users.username, normalizedUsername)).get();
    if (existing) {
      throw new Error("Username already registered");
    }

    const createdUser = authDb
      .insert(users)
      .values({
        id: randomUUID(),
        username: normalizedUsername,
        passwordHash: await this.hashPassword(password)
      })
      .returning()
      .get();

    return {
      token: signAccessToken({
        sub: createdUser.id,
        username: createdUser.username
      })
    };
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    const normalizedUsername = username.trim().toLowerCase();
    const found = authDb.select().from(users).where(eq(users.username, normalizedUsername)).get();
    if (!found) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await this.comparePassword(password, found.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return {
      token: signAccessToken({
        sub: found.id,
        username: found.username
      })
    };
  }

  getProfile(userId: string): { id: string; username: string; createdAt: string } {
    const found = authDb.select().from(users).where(eq(users.id, userId)).get();
    if (!found) {
      throw new Error("User not found");
    }
    return { id: found.id, username: found.username, createdAt: found.createdAt };
  }
}
