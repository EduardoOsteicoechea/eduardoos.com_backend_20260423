import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { authDb } from "../src/db";
import { users } from "../src/db/auth-schema";
import { hashPassword } from "../src/utils/auth";

const TEST_USERNAME = (process.env.TEST_USERNAME ?? "eduardooost@gmail.com").trim().toLowerCase();
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "DummyPass123!";

async function seedTestUser(): Promise<void> {
  if (!TEST_USERNAME) {
    throw new Error("TEST_USERNAME cannot be empty.");
  }

  const passwordHash = await hashPassword(TEST_PASSWORD);
  const existing = authDb.select().from(users).where(eq(users.username, TEST_USERNAME)).get();

  if (existing) {
    authDb.update(users).set({ passwordHash }).where(eq(users.username, TEST_USERNAME)).run();
    console.log(`Updated test user "${TEST_USERNAME}".`);
    return;
  }

  authDb
    .insert(users)
    .values({
      id: randomUUID(),
      username: TEST_USERNAME,
      passwordHash
    })
    .run();

  console.log(`Created test user "${TEST_USERNAME}".`);
}

void seedTestUser().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
