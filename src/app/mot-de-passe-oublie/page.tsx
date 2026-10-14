import { PublicShell, Flash } from "@/components/SiteChrome";
import { requestReset } from "@/app/actions/auth";

export const metadata = { title: "Mot de passe oublié" };

export default async function Page({ searchParams }: { searchParams: Promise<{ info?: string }> }) {
  const sp = await searchParams;
  return (
    <PublicShell>
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-3xl font-bold">Mot de passe oublié</h1>
        <div className="mt-6"><Flash info={sp.info} /></div>
        <form action={requestReset} className="space-y-4">
          <div><label className="label" htmlFor="email">E-mail du compte</label><input id="email" name="email" type="email" required className="field" /></div>
          <button className="btn-primary w-full">Envoyer le lien</button>
        </form>
      </div>
    </PublicShell>
  );
}
