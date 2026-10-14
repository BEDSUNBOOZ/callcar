import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Retourne true si l'action est autorisée. En cas d'erreur de base, on bloque (fail closed). */
export async function allow(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("rate_limit_hit", { p_key: key, p_max: max, p_window_seconds: windowSeconds });
  if (error) {
    console.error("rate_limit_hit", error.message);
    return false;
  }
  return data === true;
}
