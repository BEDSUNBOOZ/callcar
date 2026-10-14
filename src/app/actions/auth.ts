"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { signUpSchema } from "@/lib/validation/schemas";
import { SITE_URL } from "@/config/brand";

const msg = (path: string, key: string, value: string) => `${path}?${key}=${encodeURIComponent(value)}`;

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect(msg("/inscription", "error", parsed.error.issues[0]?.message ?? "Données invalides"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: `${SITE_URL}/auth/callback` },
  });
  if (error) redirect(msg("/inscription", "error", "Inscription impossible. Vérifiez vos informations."));
  redirect(msg("/connexion", "info", "Compte créé. Confirmez votre e-mail puis connectez-vous."));
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) redirect(msg("/connexion", "error", "E-mail ou mot de passe incorrect."));
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestReset(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(String(formData.get("email") ?? ""), {
    redirectTo: `${SITE_URL}/auth/callback?next=/dashboard/parametres`,
  });
  // Réponse identique que le compte existe ou non (pas d'énumération de comptes).
  redirect(msg("/mot-de-passe-oublie", "info", "Si un compte existe, un e-mail de réinitialisation vient d'être envoyé."));
}

export async function updatePassword(formData: FormData) {
  const { supabase } = await requireUser();
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) redirect(msg("/dashboard/parametres", "error", "10 caractères minimum."));
  const { error } = await supabase.auth.updateUser({ password });
  redirect(error ? msg("/dashboard/parametres", "error", "Mise à jour impossible.") : msg("/dashboard/parametres", "info", "Mot de passe mis à jour."));
}

export async function deleteAccount(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (formData.get("confirm") !== "SUPPRIMER") redirect(msg("/dashboard/parametres", "error", "Tapez SUPPRIMER pour confirmer."));
  await audit(user.id, "account.delete", "user", user.id);
  const { error } = await createAdminClient().auth.admin.deleteUser(user.id); // cascade sur toutes les données
  if (error) redirect(msg("/dashboard/parametres", "error", "Suppression impossible. Contactez le support."));
  await supabase.auth.signOut();
  redirect(msg("/", "info", "Votre compte a été supprimé."));
}
