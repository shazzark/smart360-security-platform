"use client";

import { useState, type FormEvent } from "react";
import { certificateLookupSchema } from "@/src/lib/validations/admin-schemas";

type Result = { success: false; message: string } | { success: true; certificate: { recipientName: string; programmeName: string; issueDate: string } };
export default function CertificateVerificationForm() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = certificateLookupSchema.safeParse({ certificateNumber: data.get("certificateNumber") });
    setResult(null);
    if (!parsed.success) { setResult({ success: false, message: parsed.error.issues[0]?.message ?? "Enter a certificate number." }); return; }
    setPending(true);
    try {
      const response = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), cache: "no-store" });
      setResult(await response.json() as Result);
    } catch { setResult({ success: false, message: "Verification is temporarily unavailable. Please try again." }); }
    finally { setPending(false); }
  }
  return <div className="mx-auto max-w-2xl"><form onSubmit={submit} aria-label="Verify certificate" className="rounded-2xl border border-slate/20 bg-white p-6 shadow-sm sm:p-9"><label htmlFor="certificateNumber" className="block font-semibold text-navy">Certificate number</label><p id="certificate-help" className="mt-2 text-sm text-slate">Enter the complete number printed on your certificate.</p><input id="certificateNumber" name="certificateNumber" required maxLength={64} autoComplete="off" spellCheck={false} placeholder="S360-…" aria-describedby="certificate-help certificate-result" className="mt-4 min-h-12 w-full min-w-0 rounded-md border border-slate/40 px-4 py-3 font-mono text-sm uppercase focus:outline-2 focus:outline-gold" /><button disabled={pending} className="mt-5 min-h-12 w-full rounded-md bg-navy px-5 py-3 font-semibold text-white hover:bg-navy/85 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-gold">{pending ? "Checking…" : "Verify certificate"}</button></form><div id="certificate-result" aria-live="polite" aria-atomic="true" className="mt-6">{result ? result.success ? <section className="rounded-xl border border-green-300 bg-green-50 p-6"><h2 className="text-xl font-semibold text-green-900">Valid certificate</h2><dl className="mt-5 space-y-4 wrap-anywhere"><div><dt className="text-sm text-slate">Recipient</dt><dd className="font-semibold">{result.certificate.recipientName}</dd></div><div><dt className="text-sm text-slate">Programme</dt><dd>{result.certificate.programmeName}</dd></div><div><dt className="text-sm text-slate">Issue date</dt><dd>{result.certificate.issueDate}</dd></div></dl></section> : <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">{result.message}</p> : null}</div></div>;
}
