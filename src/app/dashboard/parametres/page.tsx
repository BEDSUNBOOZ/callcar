import { requireUser } from "@/lib/auth";
import { Flash } from "@/components/SiteChrome";
import { PLANS, type PlanId } from "@/config/plans";
import { updateSettings } from "@/app/actions/messages";
import { updatePassword, deleteAccount } from "@/app/actions/auth";
import { startPremiumTest, cancelSubscription } from "@/app/actions/billing";

export const metadata = { title: "Paramètres" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; info?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await requireUser();
  const { data: sub } = await supabase.from("subscriptions").select("plan,status").eq("user_id", user.id).maybeSingle();
  const plan = (sub?.plan ?? "free") as PlanId;

  return (
    <>
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <div className="mt-4"><Flash error={sp.error} info={sp.info} /></div>

      <section className="panel" aria-labelledby="profil">
        <h2 id="profil" className="font-semibold">Profil, notifications et confidentialité</h2>
        <form action={updateSettings} className="mt-4 space-y-4">
          <div><label className="label" htmlFor="full_name">Nom</label><input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} className="field" /></div>
          <div><label className="label" htmlFor="email">E-mail de connexion</label><input id="email" value={user.email ?? ""} disabled className="field bg-mist" /></div>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="notify_email" defaultChecked={profile.notify_email} className="h-5 w-5" /> Recevoir un e-mail à chaque nouveau message</label>
          <div>
            <label className="label" htmlFor="retention_days">Conservation des messages (jours, 7 à 365)</label>
            <input id="retention_days" name="retention_days" type="number" min={7} max={365} defaultValue={profile.retention_days} className="field max-w-40" />
          </div>
          <button className="btn-primary">Enregistrer</button>
        </form>
      </section>

      <section className="panel mt-6" aria-labelledby="offre">
        <h2 id="offre" className="font-semibold">Votre offre : {PLANS[plan].name} {sub?.status === "test" && <span className="test-badge">MODE TEST</span>}</h2>
        <p className="mt-1 text-sm text-night-500">Le paiement en ligne n&apos;est pas encore branché : Premium est activé en mode test, sans débit.</p>
        <div className="mt-4">
          {plan === "free" ? (
            <form action={startPremiumTest}><button className="btn-dark">Activer Premium (MODE TEST)</button></form>
          ) : (
            <form action={cancelSubscription}><button className="btn-ghost">Revenir à l&apos;offre Gratuite</button></form>
          )}
        </div>
      </section>

      <section className="panel mt-6" aria-labelledby="mdp">
        <h2 id="mdp" className="font-semibold">Changer le mot de passe</h2>
        <form action={updatePassword} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="password">Nouveau mot de passe</label>
          <input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required className="field" placeholder="10 caractères minimum" />
          <button className="btn-dark">Mettre à jour</button>
        </form>
      </section>

      <section className="panel mt-6 border-red-200" aria-labelledby="suppr">
        <h2 id="suppr" className="font-semibold text-red-800">Supprimer mon compte</h2>
        <p className="mt-1 text-sm text-night-500">Action définitive : véhicules, QR codes et messages sont supprimés.</p>
        <form action={deleteAccount} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="confirm">Tapez SUPPRIMER</label>
          <input id="confirm" name="confirm" className="field" placeholder="Tapez SUPPRIMER" />
          <button className="btn-danger">Supprimer</button>
        </form>
      </section>
    </>
  );
}
