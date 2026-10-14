import Link from "next/link";
import { Logo } from "./Logo";
import { CONTACT_EMAIL } from "@/config/brand";

const links = [
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/offres", label: "Offres" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-night/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Logo />
        <nav aria-label="Navigation principale" className="order-3 flex w-full gap-5 overflow-x-auto text-sm sm:order-none sm:w-auto">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap py-2 hover:text-turquoise-dark">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
          <Link href="/connexion" className="btn-ghost">Connexion</Link>
          <Link href="/inscription" className="btn-primary">Créer un compte</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-night text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm text-white/70">Prévenez le propriétaire d&apos;un véhicule sans jamais voir ses coordonnées.</p>
        </div>
        <nav aria-label="Pied de page" className="flex flex-col gap-2 text-sm">
          <Link href="/demo">Essayer la démonstration</Link>
          <Link href="/faq">Questions fréquentes</Link>
          <Link href="/contact">Nous contacter</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
        </nav>
        <p className="text-sm text-white/70">
          Abidjan, Côte d&apos;Ivoire{CONTACT_EMAIL ? <><br />{CONTACT_EMAIL}</> : null}
        </p>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenu">{children}</main>
      <SiteFooter />
    </>
  );
}

/** Affiche les messages passés en ?error= / ?info= */
export function Flash({ error, info }: { error?: string; info?: string }) {
  if (!error && !info) return null;
  const isError = Boolean(error);
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`mb-4 rounded-xl px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-800" : "bg-turquoise-soft text-night"}`}
    >
      {error ?? info}
    </p>
  );
}
