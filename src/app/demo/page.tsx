import { PublicShell } from "@/components/SiteChrome";
import { DemoFlow } from "./DemoFlow";

export const metadata = { title: "Démonstration" };

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <p className="test-badge">DÉMONSTRATION · données fictives, rien n&apos;est envoyé</p>
        <h1 className="mt-3 text-3xl font-bold">Essayez le parcours en 30 secondes</h1>
        <DemoFlow />
      </div>
    </PublicShell>
  );
}
