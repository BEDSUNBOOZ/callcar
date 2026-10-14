import { PublicShell } from "@/components/SiteChrome";

export const metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-bold">Mentions légales</h1>
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Modèle à compléter et à faire valider par un juriste avant le lancement. Les champs entre crochets sont volontairement vides.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Éditeur</h2>
        <p className="mt-2 text-night-500">[Raison sociale] — [forme juridique] — [adresse à Abidjan] — [numéro RCCM] — [responsable de publication]</p>
        <h2 className="mt-8 text-xl font-semibold">Hébergement</h2>
        <p className="mt-2 text-night-500">[Hébergeur de l&apos;application] — [Hébergeur de la base de données]</p>
        <h2 className="mt-8 text-xl font-semibold">Données personnelles</h2>
        <p className="mt-2 text-night-500">
          Données collectées : e-mail, nom, véhicules, messages. Aucune géolocalisation. Les adresses IP des visiteurs sont conservées uniquement sous forme hachée pour lutter contre les abus. Les messages sont supprimés automatiquement selon la durée choisie par le propriétaire.
          Droits d&apos;accès, de rectification et de suppression : [adresse de contact]. Autorité de protection : [ARTCI — à vérifier selon votre situation].
        </p>
      </div>
    </PublicShell>
  );
}
