import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND, SITE_URL } from "@/config/brand";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND.name} — ${BRAND.tagline}`, template: `%s · ${BRAND.name}` },
  description: "Un véhicule vous bloque ? Scannez son QR code : le propriétaire est prévenu sans que ses coordonnées soient révélées.",
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0B1F3A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
