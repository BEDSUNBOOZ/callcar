import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client privilégié (service_role). SERVEUR UNIQUEMENT.
 * Contourne la RLS : à n'utiliser qu'après avoir vérifié les droits de l'appelant.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase serveur manquantes (SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
