import type { PlanId } from "@/config/plans";

/**
 * Abstraction du prestataire de paiement.
 * Ajoutez ici un fournisseur réel (CinetPay, Wave, Orange Money…) qui implémente BillingProvider.
 */
export interface BillingProvider {
  readonly id: string;
  readonly isTestMode: boolean;
  startCheckout(args: { userId: string; plan: PlanId }): Promise<{ status: "test" | "active"; provider: string }>;
}

export const mockProvider: BillingProvider = {
  id: "mock",
  isTestMode: true,
  async startCheckout() {
    // MODE TEST : aucun paiement n'est effectué, le statut « test » le rend visible partout.
    return { status: "test", provider: "mock" };
  },
};

export function getBillingProvider(): BillingProvider {
  const id = process.env.BILLING_PROVIDER ?? "mock";
  if (id === "mock") return mockProvider;
  throw new Error(`Prestataire de paiement « ${id} » non implémenté. Utilisez BILLING_PROVIDER=mock en attendant.`);
}
