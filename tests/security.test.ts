import { describe, it, expect } from "vitest";
import { generatePublicToken, generateThreadCode, isWellFormedToken, hashWithSalt } from "@/lib/security/tokens";
import { contactSchema, vehicleSchema, signUpSchema } from "@/lib/validation/schemas";

describe("jetons", () => {
  it("génère des jetons uniques de 22 caractères base64url", () => {
    const set = new Set(Array.from({ length: 2000 }, generatePublicToken));
    expect(set.size).toBe(2000);
    for (const t of set) {
      expect(t).toHaveLength(22);
      expect(isWellFormedToken(t)).toBe(true);
    }
  });
  it("le code de fil est plus long que le jeton public", () => {
    expect(generateThreadCode().length).toBeGreaterThan(30);
  });
  it("rejette les jetons mal formés (injection, trop courts)", () => {
    for (const bad of ["abc", "../../etc/passwd", "a".repeat(100), "x'; drop table--", ""]) expect(isWellFormedToken(bad)).toBe(false);
  });
  it("hache l'IP avec un sel et ne la contient pas", () => {
    const h = hashWithSalt("41.66.1.2", "sel");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(h).not.toContain("41.66");
    expect(hashWithSalt("41.66.1.2", "autre")).not.toBe(h);
  });
});

describe("validation du contact", () => {
  const base = { token: generatePublicToken(), reason: "blocking", body: "Votre voiture bloque la sortie." };
  it("accepte un message valide", () => expect(contactSchema.safeParse(base).success).toBe(true));
  it("rejette un motif inconnu", () => expect(contactSchema.safeParse({ ...base, reason: "hack" }).success).toBe(false));
  it("rejette les liens (spam)", () => expect(contactSchema.safeParse({ ...base, body: "Gagnez https://spam.example" }).success).toBe(false));
  it("rejette un message trop long", () => expect(contactSchema.safeParse({ ...base, body: "a".repeat(301) }).success).toBe(false));
  it("rejette un honeypot rempli", () => expect(contactSchema.safeParse({ ...base, website: "bot" }).success).toBe(false));
});

describe("autres schémas", () => {
  it("véhicule : nom obligatoire", () => expect(vehicleSchema.safeParse({ label: " " }).success).toBe(false));
  it("inscription : mot de passe de 10 caractères minimum", () => {
    expect(signUpSchema.safeParse({ fullName: "Awa Koné", email: "a@b.ci", password: "court" }).success).toBe(false);
    expect(signUpSchema.safeParse({ fullName: "Awa Koné", email: "a@b.ci", password: "assezlongmdp" }).success).toBe(true);
  });
});
