import { PublicShell } from "@/components/SiteChrome";

export const metadata = { title: "FAQ" };

const faq = [
  ["Le visiteur peut-il voir mon numéro ou ma plaque ?", "Non. La page ouverte par le scan n'affiche aucune information sur vous ni sur le véhicule."],
  ["Que faire si mon autocollant est volé ?", "Dans votre tableau de bord, remplacez le QR code : l'ancien cesse de fonctionner immédiatement."],
  ["Faut-il un compte pour me contacter ?", "Non, la personne qui scanne n'a pas besoin de s'inscrire."],
  ["Comment éviter les messages abusifs ?", "Chaque envoi est protégé par un contrôle anti-robot et des limites de fréquence. Vous pouvez signaler un message à l'équipe."],
  ["Combien de temps mes messages sont-ils conservés ?", "90 jours par défaut. Vous pouvez choisir entre 7 et 365 jours dans vos paramètres."],
  ["Puis-je supprimer mon compte ?", "Oui, depuis les paramètres. Vos véhicules, QR codes et messages sont supprimés avec lui."],
];

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-bold">Questions fréquentes</h1>
        <div className="mt-8 divide-y divide-night/10 border-y border-night/10">
          {faq.map(([q, a]) => (
            <details key={q} className="py-4">
              <summary className="font-semibold">{q}</summary>
              <p className="mt-2 text-night-500">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
