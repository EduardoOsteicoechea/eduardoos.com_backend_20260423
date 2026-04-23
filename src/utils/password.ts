import { createHash, randomBytes } from "node:crypto";

const SALT_SEPARATOR = ":";

export const hashPassword = (rawPassword: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(`${salt}${rawPassword}`)
    .digest("hex");
  return `${salt}${SALT_SEPARATOR}${hash}`;
};

export const verifyPassword = (rawPassword: string, storedHash: string): boolean => {
  const [salt, hash] = storedHash.split(SALT_SEPARATOR);
  if (!salt || !hash) {
    return false;
  }
  const attempted = createHash("sha256")
    .update(`${salt}${rawPassword}`)
    .digest("hex");
  return attempted === hash;
};
