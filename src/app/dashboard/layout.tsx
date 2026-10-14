import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireUser();
  const { data: vehicles } = await supabase.from("vehicles").select("id");
  const ids = (vehicles ?? []).map((v) => v.id);
  const { count } = ids.length
    ? await supabase.from("messages").select("id", { count: "exact", head: true }).in("vehicle_id", ids).is("read_at", null)
    : { count: 0 };
  const nav = [
    { href: "/dashboard", label: "Accueil" },
    { href: "/dashboard/vehicules", label: "Véhicules" },
    { href: "/dashboard/messages", label: count ? `Messages (${count})` : "Messages" },
    { href: "/dashboard/parametres", label: "Paramètres" },
  ];
  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-night text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo light />
          <form action={signOut}><button className="text-sm underline">Déconnexion</button></form>
        </div>
        <nav aria-label="Tableau de bord" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 text-sm">
          {nav.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10">{n.label}</Link>)}
          {profile.role === "admin" && <Link href="/admin" className="whitespace-nowrap rounded-lg px-3 py-2 text-turquoise hover:bg-white/10">Administration</Link>}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
