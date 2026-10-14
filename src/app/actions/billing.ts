"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBillingProvider } from "@/lib/billing/provider";

/** MODE TEST : active l'offre Premium sans aucun paiement réel. */
export async function startPremiumTest() {
  const { user } = await requireUser();
  const provider = getBillingProvider();
  const result = await provider.startCheckout({ userId: user.id, plan: "premium" });
  await createAdminClient()
    .from("subscriptions")
    .upsert({ user_id: user.id, plan: "premium", status: result.status, provider: result.provider }, { onConflict: "user_id" });
  await audit(user.id, "subscription.test_upgrade", "user", user.id, { provider: result.provider });
  redirect("/dashboard/parametres?info=" + encodeURIComponent("Offre Premium activée en MODE TEST (aucun paiement effectué)."));
}

export async function cancelSubscription() {
  const { user } = await requireUser();
  await createAdminClient().from("subscriptions").update({ plan: "free", status: "active", provider: "none" }).eq("user_id", user.id);
  await audit(user.id, "subscription.cancel", "user", user.id);
  redirect("/dashboard/parametres?info=" + encodeURIComponent("Retour à l'offre Gratuite."));
}
