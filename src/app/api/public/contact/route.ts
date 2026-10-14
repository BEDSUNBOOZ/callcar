import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/schemas";
import { allow } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { generateThreadCode, hashWithSalt } from "@/lib/security/tokens";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOwnerNewMessage } from "@/lib/notifications/email";
import type { ReasonId } from "@/config/plans";

export const runtime = "nodejs";

const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

/**
 * Seul point d'écriture public. Le visiteur n'a aucun accès direct à la base :
 * validation → limite par IP → captcha → limite par jeton → insertion via service_role.
 */
async function handle(req: Request) {
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
  const ipHash = hashWithSalt(ip);

  if (!(await allow(`ip:${ipHash}`, 5, 600))) return fail(429, "Trop de tentatives. Réessayez dans quelques minutes.");

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail(400, "Requête invalide.");
  }
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Données invalides.");
  const { token, reason, body, turnstileToken, website } = parsed.data;

  if (website) return NextResponse.json({ ok: true, threadCode: generateThreadCode() }); // honeypot : le robot croit avoir réussi
  if (!(await verifyTurnstile(turnstileToken, ip))) return fail(403, "Vérification anti-robot échouée.");
  if (!(await allow(`tok:${token}`, 15, 3600))) return fail(429, "Ce véhicule a reçu trop de messages récemment.");

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("qr_tokens")
    .select("id,status,vehicles(id,label,active,owner_id)")
    .eq("token", token)
    .maybeSingle();
  const vehicle = row ? (Array.isArray(row.vehicles) ? row.vehicles[0] : row.vehicles) : null;
  if (!row || row.status !== "active" || !vehicle || !vehicle.active) return fail(404, "Ce QR code n'est plus valide.");

  const { data: owner } = await admin.from("profiles").select("status,notify_email").eq("id", vehicle.owner_id).single();
  if (!owner || owner.status !== "active") return fail(404, "Ce QR code n'est plus valide.");

  const threadCode = generateThreadCode();
  const { error } = await admin
    .from("messages")
    .insert({ vehicle_id: vehicle.id, qr_token_id: row.id, reason, body, thread_code: threadCode, ip_hash: ipHash });
  if (error) return fail(500, "Message non transmis.");

  if (owner.notify_email) {
    const { data: u } = await admin.auth.admin.getUserById(vehicle.owner_id);
    if (u?.user?.email) await notifyOwnerNewMessage(u.user.email, reason as ReasonId, vehicle.label).catch(() => undefined);
  }
  return NextResponse.json({ ok: true, threadCode });
}

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (e) {
    console.error("[CARCALL] contact", e);
    return fail(503, "Service indisponible. Réessayez plus tard.");
  }
}
