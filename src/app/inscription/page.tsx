import Link from "next/link";
import { PublicShell, Flash } from "@/components/SiteChrome";
import { signUp } from "@/app/actions/auth";

export const metadata = { title: "Créer un compte" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-3xl font-bold">Créer un compte</h1>
        <div className="mt-6"><Flash error={sp.error} /></div>
        <form action={signUp} className="space-y-4">
          <div><label className="label" htmlFor="fullName">Nom complet</label><input id="fullName" name="fullName" autoComplete="name" required className="field" /></div>
          <div><label className="label" htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required className="field" /></div>
          <div><label className="label" htmlFor="password">Mot de passe (10 caractères minimum)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="field" /></div>
          <button className="btn-primary w-full">Créer mon compte</button>
        </form>
        <p className="mt-4 text-sm">Déjà inscrit ? <Link className="underline" href="/connexion">Se connecter</Link></p>
      </div>
    </PublicShell>
  );
}
