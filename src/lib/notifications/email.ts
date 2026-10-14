import "server-only";
import { REASONS, type ReasonId } from "@/config/plans";
import { SITE_URL } from "@/config/brand";

/**
 * Notification e-mail via Resend. Sans clé, on journalise seulement (aucun envoi simulé comme réel).
 * Le mail ne contient jamais d'information sur le visiteur.
 */
export async function notifyOwnerNewMessage(to: string, reason: ReasonId, vehicleLabel: string): Promise<"sent" | "skipped"> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;
  if (!key || !from) {
    console.warn("[CARCALL] RESEND_API_KEY / NOTIFY_FROM_EMAIL absents : notification non envoyée.");
    return "skipped";
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: `CARCALL — ${REASONS[reason]} : ${vehicleLabel}`,
      text: `Quelqu'un souhaite vous joindre à propos de votre véhicule « ${vehicleLabel} ».\nMotif : ${REASONS[reason]}.\n\nLisez le message et répondez : ${SITE_URL}/dashboard/messages`,
    }),
  });
  return res.ok ? "sent" : "skipped";
}
