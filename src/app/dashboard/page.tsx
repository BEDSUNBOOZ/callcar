import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PLANS, type PlanId } from "@/config/plans";

export const metadata = { title: "Tableau de bord" };

export default async function Page() {
  const { supabase, user, profile } = await requireUser();
  const [{ data: vehicles }, { data: sub }] = await Promise.all([
    supabase.from("vehicles").select("id,active"),
    supabase.from("subscriptions").select("plan,status").eq("user_id", user.id).maybeSingle(),
  ]);
  const ids = (vehicles ?? []).map((v) => v.id);
  const [{ count: unread }, { count: total }] = ids.length
    ? await Promise.all([
        supabase.from("messages").select("id", { count: "exact", head: true }).in("vehicle_id", ids).is("read_at", null),
        supabase.from("messages").select("id", { count: "exact", head: true }).in("vehicle_id", ids),
      ])
    : [{ count: 0 }, { count: 0 }];
  const plan = (sub?.plan ?? "free") as PlanId;
  const stat = (label: string, value: string | number) => (
    <div className="panel"><p className="text-sm text-night-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>
  );
  return (
    <>
      <h1 className="text-2xl font-bold">Bonjour {profile.full_name?.split(" ")[0] ?? ""}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stat("Véhicules", vehicles?.length ?? 0)}
        {stat("Messages non lus", unread ?? 0)}
        {stat("Messages reçus", total ?? 0)}
      </div>
      <p className="mt-6 text-night-500">
        Offre : <strong>{PLANS[plan].name}</strong> {sub?.status === "test" && <span className="test-badge">MODE TEST</span>}
      </p>
      {(vehicles?.length ?? 0) === 0 && (
        <div className="panel mt-6">
          <h2 className="font-semibold">Ajoutez votre premier véhicule</h2>
          <p className="mt-1 text-night-500">Vous obtiendrez un QR code à imprimer et à coller sur le pare-brise.</p>
          <Link href="/dashboard/vehicules" className="btn-primary mt-4">Ajouter un véhicule</Link>
        </div>
      )}
    </>
  );
}
