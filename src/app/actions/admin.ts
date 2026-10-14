"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleSuspend(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id"));
  if (id === user.id) return; // un admin ne se suspend pas lui-même
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("status,role").eq("id", id).single();
  if (!target || target.role === "admin") return;
  const next = target.status === "active" ? "suspended" : "active";
  await admin.from("profiles").update({ status: next }).eq("id", id);
  await audit(user.id, next === "suspended" ? "admin.suspend" : "admin.reactivate", "user", id);
  revalidatePath("/admin");
}

export async function resolveReport(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminClient();
  const { data: report } = await admin.from("abuse_reports").select("message_id").eq("id", id).single();
  await admin.from("abuse_reports").update({ status: "resolved" }).eq("id", id);
  if (report?.message_id) await admin.from("messages").update({ flagged: true }).eq("id", report.message_id);
  await audit(user.id, "admin.report_resolved", "abuse_report", id);
  revalidatePath("/admin");
}
