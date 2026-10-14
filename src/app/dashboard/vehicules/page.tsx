import { requireUser } from "@/lib/auth";
import { Flash } from "@/components/SiteChrome";
import { addVehicle, toggleVehicle, rotateQr, deleteVehicle } from "@/app/actions/vehicles";
import { publicUrl } from "@/lib/qr/generate";
import type { Vehicle, QrToken } from "@/lib/types";

export const metadata = { title: "Véhicules" };

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; info?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { data: vehicles } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false }).returns<Vehicle[]>();
  const { data: tokens } = await supabase.from("qr_tokens").select("*").eq("status", "active").returns<QrToken[]>();
  const tokenOf = (id: string) => tokens?.find((t) => t.vehicle_id === id);

  return (
    <>
      <h1 className="text-2xl font-bold">Véhicules</h1>
      <div className="mt-4"><Flash error={sp.error} info={sp.info} /></div>
      <form action={addVehicle} className="panel grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label className="label" htmlFor="label">Nom du véhicule</label><input id="label" name="label" required maxLength={60} placeholder="Toyota grise" className="field" /></div>
        <div><label className="label" htmlFor="plate">Plaque (privée, facultatif)</label><input id="plate" name="plate" maxLength={20} className="field" /></div>
        <button className="btn-primary">Ajouter</button>
      </form>

      <ul className="mt-6 space-y-4">
        {(vehicles ?? []).map((v) => {
          const t = tokenOf(v.id);
          return (
            <li key={v.id} className="panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{v.label} {!v.active && <span className="ml-2 rounded-md bg-night/10 px-2 py-0.5 text-xs">Désactivé</span>}</h2>
              </div>
              {t && v.active ? (
                <p className="mt-2 break-all text-sm text-night-500">Lien du QR : {publicUrl(t.token)}</p>
              ) : (
                <p className="mt-2 text-sm text-night-500">Aucun QR actif.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {t && <a className="btn-primary" href={`/api/qr/${v.id}`} download>Autocollant (SVG)</a>}
                {t && <a className="btn-ghost" href={`/api/qr/${v.id}?format=png`} download>QR (PNG)</a>}
                <form action={rotateQr}><input type="hidden" name="id" value={v.id} /><button className="btn-ghost">Remplacer le QR</button></form>
                <form action={toggleVehicle}><input type="hidden" name="id" value={v.id} /><input type="hidden" name="active" value={String(v.active)} /><button className="btn-ghost">{v.active ? "Désactiver" : "Réactiver"}</button></form>
                <form action={deleteVehicle}><input type="hidden" name="id" value={v.id} /><button className="btn-danger">Supprimer</button></form>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
