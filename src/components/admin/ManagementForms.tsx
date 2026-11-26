"use client";

import { useActionState, useState } from "react";
import { addCertificate, addContent, deleteContent, revokeCertificate } from "@/src/actions/admin-actions";
import type { AdminState } from "@/src/lib/validations/admin-schemas";
import ImageUpload from "./ImageUpload";
import { useActionToast } from "@/src/components/feedback/useActionToast";
import { toast } from "sonner";

const initial: AdminState = { success: false, message: "" };
const input = "mt-2 min-h-11 w-full rounded-md border border-slate/35 bg-white px-3 py-2 text-navy focus:border-navy focus:outline-2 focus:outline-gold aria-invalid:border-red-600";
const button = "min-h-11 rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/85 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-gold";
function Feedback({ state }: { state: AdminState }) {
  useActionToast(state);
  return null;
}
function Field({ name, label, type = "text", state, maxLength, required = true }: { name: string; label: string; type?: string; state: AdminState; maxLength?: number; required?: boolean }) {
  const errors = state.errors?.[name];
  return <label className="block text-sm font-medium">{label}<input name={name} type={type} required={required} maxLength={maxLength} className={input} aria-invalid={Boolean(errors?.length)} aria-describedby={errors?.length ? `${name}-error` : undefined} />{errors?.length ? <span id={`${name}-error`} className="mt-1 block text-red-700">{errors.join(" ")}</span> : null}</label>;
}
export function ContentForm({ kind }: { kind: "services" | "programmes" | "blog" }) {
  const [imageUrl, setImageUrl] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [state, action, pending] = useActionState(async (previous: AdminState, form: FormData) => {
    const result = await addContent(previous, form);
    if (result.success) setImageUrl("");
    return result;
  }, initial);
  return <form action={action} aria-label="Add content" className="my-8 w-full space-y-5 rounded-xl border border-slate/20 bg-white p-6"><h2 className="text-xl font-semibold">Add {kind === "blog" ? "blog post" : kind === "services" ? "service" : "programme"}</h2><p className="text-sm text-slate">Submitting publishes this content to the public website.</p><input type="hidden" name="kind" value={kind} /><Field name="title" label="Title" maxLength={191} state={state} /><label className="block text-sm font-medium">{kind === "blog" ? "Article content" : "Description"}<textarea required name="description" minLength={10} maxLength={10000} rows={5} className={input} aria-invalid={Boolean(state.errors?.description?.length)} aria-describedby="description-error" /><span id="description-error" className="block text-red-700">{state.errors?.description?.join(" ")}</span></label><ImageUpload value={imageUrl} onChange={setImageUrl} busy={uploadBusy} onBusy={setUploadBusy} disabled={pending} /><span className="block text-sm text-red-700">{state.errors?.imageUrl?.join(" ")}</span><button disabled={pending || uploadBusy} className={button}>{pending ? "Publishing…" : uploadBusy ? "Uploading image…" : "Publish content"}</button><Feedback state={state} /></form>;
}
export function CertificateForm() {
  const [state, action, pending] = useActionState(addCertificate, initial);
  return <form action={action} aria-label="Issue certificate" className="my-8 w-full space-y-5 rounded-xl border border-slate/20 bg-white p-6"><h2 className="text-xl font-semibold">Issue a certificate</h2><p className="text-sm text-slate">A unique certificate number is generated securely when issued.</p><Field name="recipientName" label="Recipient name" maxLength={100} state={state} /><Field name="programmeName" label="Programme name" maxLength={191} state={state} /><div className="grid gap-5 sm:grid-cols-2"><Field name="issueDate" label="Issue date" type="date" state={state} /><Field name="expiryDate" label="Expiry date (optional)" type="date" required={false} state={state} /></div><button disabled={pending} className={button}>{pending ? "Issuing…" : "Issue certificate"}</button><Feedback state={state} /></form>;
}
export function RecordButton({ id, kind, revoke = false }: { id: string; kind?: "services" | "programmes" | "blog"; revoke?: boolean }) {
  const [state, action, pending] = useActionState(async (previous: AdminState, form: FormData) => {
    const result = await (revoke ? revokeCertificate : deleteContent)(previous, form);
    // A deleted row unmounts immediately; deliver feedback before its component disappears.
    if (result.success) toast.success(result.message); else toast.error(result.message);
    return result;
  }, initial);
  return <form action={action} onSubmit={event => { if (!window.confirm(revoke ? "Revoke this certificate? It will no longer verify." : "Permanently delete this content?")) event.preventDefault(); }}><input type="hidden" name="id" value={id} />{kind ? <input type="hidden" name="kind" value={kind} /> : null}<button disabled={pending || state.success} className="min-h-11 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-red-700">{pending ? "Saving…" : revoke ? "Revoke" : "Delete"}</button></form>;
}
