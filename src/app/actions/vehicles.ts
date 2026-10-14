"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { vehicleSchema } from "@/lib/validation/schemas";
import { generatePublicToken } from "@/lib/security/tokens";
import { PLANS, type PlanId } from "@/config/plans";

const back = (key: string, value: string) => redirect(`/dashboard/vehicules?${key}=${encodeURIComponent(value)}`);

export async function addVehicle(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = vehicleSchema.safeParse({ label: formData.get("label"), plate: formData.get("plate") || undefined });
  if (!parsed.success) back("error", parsed.error.issues[0]?.message ?? "Données invalides");
  const data = parsed.data!;

  const { data: sub } = await supabase.from("subscriptions").select("plan,status").eq("user_id", user.id).maybeSingle();
  const plan: PlanId = sub && sub.status !== "canceled" ? (sub.plan as PlanId) : "free";
  const { count } = await supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("owner_id", user.id);
  if ((count ?? 0) >= PLANS[plan].maxVehicles) back("error", `Votre offre ${PLANS[plan].name} est limitée à ${PLANS[plan].maxVehicles} véhicule(s).`);

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .insert({ owner_id: user.id, label: data.label, plate: data.plate ?? null })
    .select("id")
    .single();
  if (error || !vehicle) back("error", "Ajout impossible.");
  const { error: qrError } = await supabase.from("qr_tokens").insert({ vehicle_id: vehicle!.id, token: generatePublicToken() });
  if (qrError) back("error", "QR code non généré.");
  await audit(user.id, "vehicle.create", "vehicle", vehicle!.id);
  revalidatePath("/dashboard/vehicules");
  back("info", "Véhicule ajouté.");
}

export async function toggleVehicle(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await supabase.from("vehicles").update({ active: !active }).eq("id", id);
  await audit(user.id, active ? "vehicle.deactivate" : "vehicle.activate", "vehicle", id);
  revalidatePath("/dashboard/vehicules");
}

/** Révoque l'ancien QR (il cesse immédiatement de fonctionner) et en crée un nouveau. */
export async function rotateQr(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  const { error: e1 } = await supabase
    .from("qr_tokens")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("vehicle_id", id)
    .eq("status", "active");
  if (e1) back("error", "Révocation impossible.");
  const { error: e2 } = await supabase.from("qr_tokens").insert({ vehicle_id: id, token: generatePublicToken() });
  if (e2) back("error", "Nouveau QR non créé.");
  await audit(user.id, "qr.rotate", "vehicle", id);
  revalidatePath("/dashboard/vehicules");
  back("info", "Nouveau QR code généré. L'ancien est révoqué : remplacez l'autocollant.");
}

export async function deleteVehicle(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id"));
  await supabase.from("vehicles").delete().eq("id", id);
  await audit(user.id, "vehicle.delete", "vehicle", id);
  revalidatePath("/dashboard/vehicules");
}
