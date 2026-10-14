import { describe, it, expect } from "vitest";
import { stickerSvg, qrPng, publicUrl } from "@/lib/qr/generate";
import { generatePublicToken } from "@/lib/security/tokens";

describe("QR", () => {
  it("l'autocollant ne contient que l'URL publique, pas de donnée personnelle", async () => {
    const t = generatePublicToken();
    const svg = await stickerSvg(t);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("CARCALL");
    expect(publicUrl(t)).toContain(`/v/${t}`);
  });
  it("génère un PNG valide", async () => {
    const png = await qrPng(generatePublicToken());
    expect(png.subarray(1, 4).toString()).toBe("PNG");
  });
});
