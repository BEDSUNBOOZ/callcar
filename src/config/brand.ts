export const BRAND = {
  name: "CARCALL",
  tagline: "Contactez le propriétaire, sans rien révéler.",
  colors: { nightBlue: "#0B1F3A", turquoise: "#14B8A6", white: "#FFFFFF" },
} as const;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
