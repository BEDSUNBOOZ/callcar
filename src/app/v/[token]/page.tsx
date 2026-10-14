import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isWellFormedToken } from "@/lib/security/tokens";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contacter le propriétaire", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function Unavailable() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Ce QR code n&apos;est plus valide</h1>
      <p className="mt-3 text-night-500">Le propriétaire l&apos;a peut-être remplacé ou désactivé.</p>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isWellFormedToken(token)) notFound();

  let valid = false;
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data: row } = await createAdminClient().from("qr_tokens").select("status,vehicles(active,profiles(status))").eq("token", token).maybeSingle();
    const v = row ? (Array.isArray(row.vehicles) ? row.vehicles[0] : row.vehicles) : null;
    const p = v ? (Array.isArray(v.profiles) ? v.profiles[0] : v.profiles) : null;
    valid = Boolean(row && row.status === "active" && v?.active && p?.status === "active");
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-night px-4 py-3"><Logo light /></header>
      {valid ? (
        <main className="mx-auto max-w-md px-4 py-8">
          <h1 className="text-2xl font-bold">Prévenir le propriétaire</h1>
          <p className="mt-2 text-night-500">Votre message est transmis sans révéler votre identité. Aucune localisation n&apos;est demandée.</p>
          <ContactForm token={token} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
        </main>
      ) : (
        <Unavailable />
      )}
    </div>
  );
}
