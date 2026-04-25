import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { authDb } from "../src/db";
import { users } from "../src/db/auth-schema";
import { hashPassword } from "../src/utils/auth";

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME ?? "eduardoost@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMeNow123!";

async function seedAdmin(): Promise<void> {
  if (!ADMIN_USERNAME) {
    throw new Error("ADMIN_USERNAME cannot be empty.");
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const existing = authDb.select().from(users).where(eq(users.username, ADMIN_USERNAME)).get();

  if (existing) {
    authDb
      .update(users)
      .set({ passwordHash })
      .where(eq(users.username, ADMIN_USERNAME))
      .run();
    console.log(`Updated existing admin user "${ADMIN_USERNAME}".`);
    return;
  }

  authDb
    .insert(users)
    .values({
      id: randomUUID(),
      username: ADMIN_USERNAME,
      passwordHash
    })
    .run();

  console.log(`Created admin user "${ADMIN_USERNAME}".`);
}

void seedAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
