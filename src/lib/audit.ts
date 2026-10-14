import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Journalise une action sensible (écriture via service_role, lecture réservée aux admins). */
export async function audit(actorId: string | null, action: string, targetType?: string, targetId?: string, meta: Record<string, unknown> = {}) {
  try {
    await createAdminClient().from("audit_logs").insert({ actor_id: actorId, action, target_type: targetType, target_id: targetId, meta });
  } catch (e) {
    console.error("audit", e);
  }
}
