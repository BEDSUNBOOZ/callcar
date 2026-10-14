import Link from "next/link";
import { PublicShell } from "@/components/SiteChrome";
import { PLANS, type PlanId } from "@/config/plans";

export const metadata = { title: "Offres" };

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl font-bold">Des offres simples</h1>
        <p className="mt-2 max-w-2xl text-night-500">
          Le paiement en ligne n&apos;est pas encore disponible : l&apos;activation de Premium se fait en <span className="test-badge">MODE TEST</span> sans aucun débit.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const p = PLANS[id];
            return (
              <div key={id} className={`panel flex flex-col ${id === "premium" ? "border-turquoise ring-2 ring-turquoise" : ""}`}>
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="mt-1 text-2xl font-bold">{p.price}</p>
                <ul className="mt-4 flex-1 space-y-2 text-night-500">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link href={id === "enterprise" ? "/contact" : "/inscription"} className={id === "premium" ? "btn-primary mt-6" : "btn-ghost mt-6"}>
                  {id === "enterprise" ? "Nous contacter" : id === "free" ? "Commencer gratuitement" : "Créer un compte"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </PublicShell>
  );
}
