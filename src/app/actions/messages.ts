"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { replySchema } from "@/lib/validation/schemas";

export async function markRead(formData: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", String(formData.get("id"))).is("read_at", null);
  revalidatePath("/dashboard", "layout");
}

export async function replyToMessage(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = replySchema.safeParse({ messageId: formData.get("messageId"), reply: formData.get("reply") });
  if (!parsed.success) redirect(`/dashboard/messages?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Réponse invalide")}`);
  const { error } = await supabase
    .from("messages")
    .update({ owner_reply: parsed.data!.reply, replied_at: new Date().toISOString(), read_at: new Date().toISOString() })
    .eq("id", parsed.data!.messageId);
  if (error) redirect("/dashboard/messages?error=" + encodeURIComponent("Réponse non envoyée."));
  await audit(user.id, "message.reply", "message", parsed.data!.messageId);
  revalidatePath("/dashboard/messages");
}

export async function reportAbuse(formData: FormData) {
  const { supabase, user } = await requireUser();
  const messageId = String(formData.get("messageId"));
  const { data: m } = await supabase.from("messages").select("vehicle_id").eq("id", messageId).maybeSingle();
  if (!m) redirect("/dashboard/messages");
  await supabase.from("abuse_reports").insert({
    message_id: messageId,
    vehicle_id: m!.vehicle_id,
    reporter_id: user.id,
    reason: String(formData.get("reason") || "Message abusif").slice(0, 500),
  });
  redirect("/dashboard/messages?info=" + encodeURIComponent("Signalement transmis à l'équipe."));
}

export async function deleteMessage(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  await supabase.from("messages").delete().eq("id", id);
  await audit(user.id, "message.delete", "message", id);
  revalidatePath("/dashboard/messages");
}

export async function updateSettings(formData: FormData) {
  const { supabase, user } = await requireUser();
  const days = Math.min(365, Math.max(7, Number(formData.get("retention_days")) || 90));
  await supabase
    .from("profiles")
    .update({ full_name: String(formData.get("full_name") ?? "").slice(0, 100), notify_email: formData.get("notify_email") === "on", retention_days: days })
    .eq("id", user.id);
  redirect("/dashboard/parametres?info=" + encodeURIComponent("Paramètres enregistrés."));
}
