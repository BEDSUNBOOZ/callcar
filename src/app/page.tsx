import Link from "next/link";
import { PublicShell } from "@/components/SiteChrome";
import { Sticker } from "@/components/Sticker";

const steps = [
  { t: "Collez l'autocollant", d: "Imprimez votre QR code CARCALL et placez-le sur le pare-brise ou la vitre arrière." },
  { t: "Un passant scanne", d: "Il choisit un motif et écrit un message court, sans créer de compte." },
  { t: "Vous êtes prévenu", d: "Vous recevez une notification et pouvez répondre, sans que votre numéro ne soit jamais affiché." },
];

export default function Home() {
  return (
    <PublicShell>
      <section className="bg-night text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Une voiture vous bloque ? Un scan, et son propriétaire est prévenu.</h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              CARCALL met en relation un passant et le propriétaire d&apos;un véhicule sans révéler ni numéro, ni plaque, ni identité.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/inscription" className="btn-primary">Protéger mon véhicule</Link>
              <Link href="/demo" className="btn border border-white/30 text-white hover:bg-white/10">Essayer la démonstration</Link>
            </div>
          </div>
          <Sticker className="mx-auto w-56 rotate-3 drop-shadow-2xl sm:w-64" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-2xl font-bold">Trois gestes, aucune coordonnée partagée</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.t} className="panel">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-turquoise-soft font-bold text-turquoise-dark">{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-night-500">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-10 px-4 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Votre vie privée passe en premier</h2>
          <p className="mt-3 text-night-500">Les visiteurs ne voient jamais votre plaque ni vos coordonnées. Vous pouvez révoquer un QR code à tout moment si l&apos;autocollant est volé ou copié.</p>
        </div>
        <ul className="space-y-3 text-night-500">
          <li className="panel">Jetons aléatoires impossibles à deviner</li>
          <li className="panel">Protection anti-robots et limites d&apos;envoi</li>
          <li className="panel">Messages supprimés automatiquement après la durée de votre choix</li>
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="rounded-3xl bg-turquoise-soft p-8 text-center">
          <h2 className="text-2xl font-bold">Gratuit pour un véhicule</h2>
          <p className="mx-auto mt-2 max-w-xl text-night-500">Premium pour plusieurs véhicules, Entreprise pour les flottes, églises, hôtels et parkings.</p>
          <Link href="/offres" className="btn-dark mt-5">Voir les offres</Link>
        </div>
      </section>
    </PublicShell>
  );
}
