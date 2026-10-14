import Link from "next/link";
import { PublicShell } from "@/components/SiteChrome";

export const metadata = { title: "Comment ça marche" };

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-bold">Comment ça marche</h1>
        <h2 className="mt-8 text-xl font-semibold">Pour le propriétaire</h2>
        <p className="mt-2 text-night-500">Créez un compte, ajoutez votre véhicule, téléchargez l&apos;autocollant et collez-le. Vous pouvez désactiver le véhicule ou remplacer le QR code à tout moment.</p>
        <h2 className="mt-8 text-xl font-semibold">Pour la personne qui scanne</h2>
        <p className="mt-2 text-night-500">Aucun compte. Elle choisit un motif (véhicule gênant, phares allumés, portière ouverte, urgence ou autre), écrit un message de 300 caractères maximum et reçoit une confirmation.</p>
        <h2 className="mt-8 text-xl font-semibold">Ce que CARCALL ne fait pas</h2>
        <p className="mt-2 text-night-500">Aucune géolocalisation n&apos;est collectée. La plaque d&apos;immatriculation et vos coordonnées ne sont jamais affichées publiquement.</p>
        <Link href="/demo" className="btn-primary mt-8">Essayer la démonstration</Link>
      </div>
    </PublicShell>
  );
}
