import { Logo } from "@/components/Logo";
import { createAdminClient } from "@/lib/supabase/admin";
import { isWellFormedToken } from "@/lib/security/tokens";

export const metadata = { title: "Réponse du propriétaire", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Le visiteur ne voit que SA conversation (code secret de 192 bits) : jamais d'historique global. */
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let message: { owner_reply: string | null; read_at: string | null } | null = null;
  if (isWellFormedToken(code)) {
    const { data } = await createAdminClient().from("messages").select("owner_reply,read_at").eq("thread_code", code).maybeSingle();
    message = data;
  }
  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-night px-4 py-3"><Logo light /></header>
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold">Réponse du propriétaire</h1>
        {!message ? (
          <p className="mt-4 text-night-500">Conversation introuvable ou supprimée.</p>
        ) : message.owner_reply ? (
          <p className="mt-4 rounded-2xl bg-white p-5">{message.owner_reply}</p>
        ) : (
          <p className="mt-4 text-night-500">{message.read_at ? "Le propriétaire a lu votre message et n'a pas encore répondu." : "Pas encore de réponse. Revenez dans quelques instants."}</p>
        )}
      </main>
    </div>
  );
}
