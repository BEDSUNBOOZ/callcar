import { PublicShell } from "@/components/SiteChrome";
import { CONTACT_EMAIL } from "@/config/brand";

export const metadata = { title: "Contact" };

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-bold">Nous contacter</h1>
        <p className="mt-3 text-night-500">Une question, un besoin pour une flotte ou une organisation ?</p>
        {CONTACT_EMAIL ? (
          <a className="btn-primary mt-6" href={`mailto:${CONTACT_EMAIL}`}>Écrire à {CONTACT_EMAIL}</a>
        ) : (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Adresse de contact non configurée : renseignez NEXT_PUBLIC_CONTACT_EMAIL.</p>
        )}
      </div>
    </PublicShell>
  );
}
