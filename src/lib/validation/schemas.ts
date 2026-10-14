import { z } from "zod";

export const reasonEnum = z.enum(["blocking", "lights_on", "door_open", "urgent", "other"]);

/** Contrôle de contenu minimal : pas de liens (spam). */
const noLinks = (s: string) => !/(https?:\/\/|www\.)/i.test(s);

export const contactSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/),
  reason: reasonEnum,
  body: z
    .string()
    .trim()
    .min(3, "Message trop court")
    .max(300, "300 caractères maximum")
    .refine(noLinks, "Les liens ne sont pas autorisés"),
  turnstileToken: z.string().max(2048).optional(),
  website: z.string().max(0).optional(), // honeypot : doit rester vide
});

export const vehicleSchema = z.object({
  label: z.string().trim().min(1, "Donnez un nom au véhicule").max(60),
  plate: z.string().trim().max(20).optional(),
});

export const replySchema = z.object({
  messageId: z.string().uuid(),
  reply: z.string().trim().min(1).max(300).refine(noLinks, "Les liens ne sont pas autorisés"),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(10, "10 caractères minimum").max(128),
});
