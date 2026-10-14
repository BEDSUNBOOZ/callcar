import Link from "next/link";
import { PublicShell, Flash } from "@/components/SiteChrome";
import { signIn } from "@/app/actions/auth";

export const metadata = { title: "Connexion" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; info?: string }> }) {
  const sp = await searchParams;
  const error = sp.error === "config" ? "Supabase n'est pas configuré (voir .env.local)." : sp.error === "suspended" ? "Ce compte est suspendu." : sp.error;
  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <div className="mt-6"><Flash error={error} info={sp.info} /></div>
        <form action={signIn} className="space-y-4">
          <div><label className="label" htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required className="field" /></div>
          <div><label className="label" htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" required className="field" /></div>
          <button className="btn-primary w-full">Se connecter</button>
        </form>
        <p className="mt-4 text-sm"><Link className="underline" href="/mot-de-passe-oublie">Mot de passe oublié ?</Link></p>
        <p className="mt-2 text-sm">Pas de compte ? <Link className="underline" href="/inscription">Créer un compte</Link></p>
      </div>
    </PublicShell>
  );
}
