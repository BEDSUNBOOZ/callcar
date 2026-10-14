"use client";

import { useState } from "react";
import { REASONS, type ReasonId } from "@/config/plans";
import { DEMO } from "@/demo/data";

export function DemoFlow() {
  const [reason, setReason] = useState<ReasonId>("blocking");
  const [body, setBody] = useState<string>(DEMO.sampleMessages.blocking);
  const [sent, setSent] = useState(false);

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <section className="panel" aria-labelledby="visiteur">
        <h2 id="visiteur" className="font-semibold">1. Vous scannez le QR code</h2>
        {sent ? (
          <p role="status" className="mt-4 rounded-xl bg-turquoise-soft p-4">Message transmis (démo). Le propriétaire a été prévenu.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="reason">Motif</label>
              <select id="reason" className="field" value={reason} onChange={(e) => { const r = e.target.value as ReasonId; setReason(r); setBody(DEMO.sampleMessages[r]); }}>
                {Object.entries(REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="body">Message</label>
              <textarea id="body" className="field" rows={4} maxLength={300} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <button className="btn-primary w-full" disabled={body.trim().length < 3} onClick={() => setSent(true)}>Prévenir le propriétaire</button>
          </div>
        )}
      </section>
      <section className="panel" aria-labelledby="proprio">
        <h2 id="proprio" className="font-semibold">2. Le propriétaire le reçoit</h2>
        {sent ? (
          <div className="mt-4 rounded-xl border border-turquoise p-4">
            <p className="text-sm text-night-500">{DEMO.vehicleLabel} · {REASONS[reason]}</p>
            <p className="mt-2">{body}</p>
            <p className="mt-3 text-xs text-night-300">Aucun numéro, aucune plaque : seulement le message.</p>
          </div>
        ) : (
          <p className="mt-4 text-night-500">Envoyez un message pour voir ce que reçoit {DEMO.ownerFirstName}.</p>
        )}
        {sent && <button className="btn-ghost mt-4" onClick={() => setSent(false)}>Recommencer</button>}
      </section>
    </div>
  );
}
