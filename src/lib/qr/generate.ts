import QRCode from "qrcode";
import { SITE_URL } from "@/config/brand";

export const publicUrl = (token: string) => `${SITE_URL}/v/${token}`;

export async function qrPng(token: string): Promise<Buffer> {
  return QRCode.toBuffer(publicUrl(token), { type: "png", width: 1024, margin: 2, errorCorrectionLevel: "M" });
}

/** Autocollant imprimable (SVG vectoriel) : QR + consigne. Ne contient aucune donnée personnelle. */
export async function stickerSvg(token: string): Promise<string> {
  const raw = await QRCode.toString(publicUrl(token), { type: "svg", margin: 0, errorCorrectionLevel: "M" });
  const inner = raw.replace(/<\?xml[^>]*\?>/, "").replace(/<svg /, '<svg x="90" y="150" width="420" height="420" ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
  <rect width="600" height="760" rx="36" fill="#0B1F3A"/>
  <rect x="60" y="120" width="480" height="480" rx="24" fill="#ffffff"/>
  ${inner}
  <text x="300" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#14B8A6">CARCALL</text>
  <text x="300" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#ffffff">Ce véhicule vous gêne ?</text>
  <text x="300" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#14B8A6">Scannez, le propriétaire sera prévenu.</text>
</svg>`;
}
