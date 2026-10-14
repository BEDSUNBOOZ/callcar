import { requireUser } from "@/lib/auth";
import { Flash } from "@/components/SiteChrome";
import { REASONS, type ReasonId } from "@/config/plans";
import { markRead, replyToMessage, reportAbuse, deleteMessage } from "@/app/actions/messages";
import type { Message } from "@/lib/types";

export const metadata = { title: "Messages" };

const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Abidjan" }).format(new Date(d));

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; info?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { data: messages } = await supabase
    .from("messages")
    .select("id,vehicle_id,reason,body,read_at,owner_reply,replied_at,flagged,created_at,vehicles(label)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="mt-4"><Flash error={sp.error} info={sp.info} /></div>
      {(messages ?? []).length === 0 && <p className="text-night-500">Aucun message pour le moment.</p>}
      <ul className="space-y-4">
        {(messages ?? []).map((raw) => {
          const m = raw as unknown as Message & { vehicles: { label: string } | { label: string }[] | null };
          const label = Array.isArray(m.vehicles) ? m.vehicles[0]?.label : m.vehicles?.label;
          return (
            <li key={m.id} className={`panel ${m.read_at ? "" : "border-turquoise ring-1 ring-turquoise"}`}>
              <p className="text-sm text-night-500">
                {!m.read_at && <span className="mr-2 rounded-md bg-turquoise px-2 py-0.5 text-xs font-semibold text-night">Non lu</span>}
                {label} · {REASONS[m.reason as ReasonId] ?? m.reason} · {fmt(m.created_at)}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
              {m.owner_reply ? (
                <p className="mt-3 rounded-xl bg-mist p-3 text-sm"><strong>Votre réponse :</strong> {m.owner_reply}</p>
              ) : (
                <form action={replyToMessage} className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="messageId" value={m.id} />
                  <label className="sr-only" htmlFor={`r-${m.id}`}>Votre réponse</label>
                  <input id={`r-${m.id}`} name="reply" required maxLength={300} placeholder="Répondre (le visiteur ne verra pas vos coordonnées)" className="field" />
                  <button className="btn-dark">Répondre</button>
                </form>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {!m.read_at && <form action={markRead}><input type="hidden" name="id" value={m.id} /><button className="btn-ghost">Marquer comme lu</button></form>}
                <form action={reportAbuse}><input type="hidden" name="messageId" value={m.id} /><input type="hidden" name="reason" value="Message abusif" /><button className="btn-ghost">Signaler</button></form>
                <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><button className="btn-danger">Supprimer</button></form>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
