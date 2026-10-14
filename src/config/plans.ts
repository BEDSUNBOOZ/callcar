export type PlanId = "free" | "premium" | "enterprise";

export const PLANS: Record<PlanId, { name: string; price: string; maxVehicles: number; features: string[] }> = {
  free: {
    name: "Gratuit",
    price: "0 FCFA",
    maxVehicles: 1,
    features: ["1 véhicule", "QR code imprimable", "Messages anonymes", "Notification par e-mail"],
  },
  premium: {
    name: "Premium",
    price: "Tarif à définir",
    maxVehicles: 5,
    features: ["Jusqu'à 5 véhicules", "Réponses via messagerie intermédiaire", "Conservation des messages personnalisable"],
  },
  enterprise: {
    name: "Entreprise",
    price: "Sur devis",
    maxVehicles: 500,
    features: ["Flotte de véhicules", "Équipe et permissions", "Support dédié (églises, hôtels, parkings, entreprises)"],
  },
};

export const REASONS = {
  blocking: "Véhicule gênant",
  lights_on: "Phares allumés",
  door_open: "Portière ouverte",
  urgent: "Urgence",
  other: "Autre",
} as const;
export type ReasonId = keyof typeof REASONS;
