import { randomBytes, createHash } from "node:crypto";

/** Jeton public : 128 bits aléatoires, base64url (22 caractères), non prédictible. */
export function generatePublicToken(): string {
  return randomBytes(16).toString("base64url");
}

/** Code secret de fil de discussion remis au visiteur (192 bits). */
export function generateThreadCode(): string {
  return randomBytes(24).toString("base64url");
}

const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;
export const isWellFormedToken = (t: string) => TOKEN_RE.test(t);

/** Hache une valeur sensible (IP) avec un sel serveur : jamais d'IP en clair en base. */
export function hashWithSalt(value: string, salt = process.env.RATE_LIMIT_SALT ?? "dev-only-salt"): string {
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}
