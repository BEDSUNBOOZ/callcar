import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { toggleSuspend, resolveReport } from "@/app/actions/admin";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export const metadata = { title: "Administration" };
export const dynamic = "force-dynamic";

const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Abidjan" }).format(new Date(d));

export default async function Page() {
  const { user } = await requireAdmin();
  const admin = createAdminClient();
  const count = async (table: string) => (await admin.from(table).select("id", { count: "exact", head: true })).count ?? 0;
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const [users, vehicles, messages, weekly] = await Promise.all([
    count("profiles"),
    count("vehicles"),
    count("messages"),
    admin.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since).then((r) => r.count ?? 0),
  ]);
  const { data: profiles } = await admin.from("profiles").select("id,full_name,role,status,created_at").order("created_at", { ascending: false }).limit(50);
  const { data: reports } = await admin.from("abuse_reports").select("id,reason,status,created_at,message_id").order("created_at", { ascending: false }).limit(30);
  const { data: logs } = await admin.from("audit_logs").select("id,actor_id,action,target_type,target_id,created_at").order("created_at", { ascending: false }).limit(30);

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-night text-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"><Logo light /><Link href="/dashboard" className="text-sm underline">Retour au tableau de bord</Link></div></header>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <h1 className="text-2xl font-bold">Administration</h1>
        <div className="grid gap-4 sm:grid-cols-4">
          {[["Utilisateurs", users], ["Véhicules", vehicles], ["Messages", messages], ["Messages (7 jours)", weekly]].map(([l, v]) => (
            <div key={String(l)} className="panel"><p className="text-sm text-night-500">{l}</p><p className="mt-1 text-3xl font-bold">{v}</p></div>
          ))}
        </div>

        <section className="panel overflow-x-auto" aria-labelledby="u">
          <h2 id="u" className="font-semibold">Utilisateurs</h2>
          <table className="mt-3 w-full min-w-[32rem] text-left text-sm">
            <thead><tr className="text-night-500"><th className="py-2">Nom</th><th>Rôle</th><th>Statut</th><th>Inscrit</th><th /></tr></thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.id} className="border-t border-night/10">
                  <td className="py-2">{p.full_name ?? "—"}</td><td>{p.role}</td><td>{p.status === "suspended" ? "Suspendu" : "Actif"}</td><td>{fmt(p.created_at)}</td>
                  <td className="text-right">{p.role !== "admin" && p.id !== user.id && (
                    <form action={toggleSuspend}><input type="hidden" name="id" value={p.id} /><button className="btn-ghost min-h-9 py-1">{p.status === "active" ? "Suspendre" : "Réactiver"}</button></form>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel" aria-labelledby="r">
          <h2 id="r" className="font-semibold">Signalements</h2>
          {(reports ?? []).length === 0 && <p className="mt-2 text-sm text-night-500">Aucun signalement.</p>}
          <ul className="mt-3 divide-y divide-night/10">
            {(reports ?? []).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>{fmt(r.created_at)} · {r.reason} · <em>{r.status === "open" ? "ouvert" : "traité"}</em></span>
                {r.status === "open" && <form action={resolveReport}><input type="hidden" name="id" value={r.id} /><button className="btn-ghost min-h-9 py-1">Marquer traité</button></form>}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel overflow-x-auto" aria-labelledby="l">
          <h2 id="l" className="font-semibold">Journal des actions sensibles</h2>
          <table className="mt-3 w-full min-w-[32rem] text-left text-sm">
            <thead><tr className="text-night-500"><th className="py-2">Date</th><th>Action</th><th>Cible</th></tr></thead>
            <tbody>{(logs ?? []).map((l) => <tr key={l.id} className="border-t border-night/10"><td className="py-2">{fmt(l.created_at)}</td><td>{l.action}</td><td className="break-all">{l.target_type} {l.target_id}</td></tr>)}</tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
