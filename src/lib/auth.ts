import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/connexion");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single<Profile>();
  if (!profile || profile.status === "suspended") {
    await supabase.auth.signOut();
    redirect("/connexion?error=suspended");
  }
  return { supabase, user: data.user, profile };
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") redirect("/dashboard");
  return ctx;
}
