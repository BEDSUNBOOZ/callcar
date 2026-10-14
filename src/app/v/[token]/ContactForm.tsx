"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import Link from "next/link";
import { REASONS, type ReasonId } from "@/config/plans";

export function ContactForm({ token, siteKey }: { token: string; siteKey: string }) {
  const [reason, setReason] = useState<ReasonId>("blocking");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [threadCode, setThreadCode] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const fd = new FormData(formRef.current!);
    const res = await fetch("/api/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, reason, body, website: fd.get("website") ?? "", turnstileToken: fd.get("cf-turnstile-response") ?? undefined }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    if (json?.ok) {
      setThreadCode(json.threadCode);
      setStatus("done");
    } else {
      setError(json?.error ?? "Envoi impossible. Réessayez.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="mt-8 rounded-2xl bg-white p-6">
        <h2 className="text-xl font-semibold">Message transmis</h2>
        <p className="mt-2 text-night-500">Le propriétaire a été prévenu. Vous pouvez vérifier s&apos;il a répondu en gardant ce lien.</p>
        <Link className="btn-ghost mt-4" href={`/m/${threadCode}`}>Voir la réponse éventuelle</Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} className="mt-6 space-y-4 rounded-2xl bg-white p-5">
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />}
      <fieldset>
        <legend className="label">Motif</legend>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(REASONS).map(([k, v]) => (
            <label key={k} className={`flex min-h-11 cursor-pointer items-center rounded-xl border px-3 text-sm ${reason === k ? "border-turquoise bg-turquoise-soft font-semibold" : "border-night/20"}`}>
              <input type="radio" name="reason" value={k} checked={reason === k} onChange={() => setReason(k as ReasonId)} className="sr-only" />
              {v}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="body">Message (300 caractères maximum)</label>
        <textarea id="body" required minLength={3} maxLength={300} rows={4} className="field" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ex. : votre voiture bloque la sortie." />
      </div>
      {/* Honeypot : invisible pour les humains */}
      <div aria-hidden="true" className="absolute left-[-9999px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      {siteKey && <div className="cf-turnstile" data-sitekey={siteKey} />}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <button className="btn-primary w-full" disabled={status === "sending"}>{status === "sending" ? "Envoi…" : "Prévenir le propriétaire"}</button>
    </form>
  );
}
