"use client";

import { useActionState } from "react";
import { updatePage } from "@/src/actions/page-actions";
import { useActionToast } from "@/src/components/feedback/useActionToast";
import type { AdminState } from "@/src/lib/validations/admin-schemas";

const initial: AdminState = { success: false, message: "" };
const input = "mt-2 w-full rounded-md border border-slate/30 bg-white px-4 py-3 text-navy focus-visible:outline-2 focus-visible:outline-gold aria-invalid:border-red-700";
export default function PageEditor({ page }: { page: { slug: string; title: string; content: string } }) {
  const [state, action, pending] = useActionState(updatePage, initial);
  useActionToast(state);
  return <form action={action} aria-label={`Edit ${page.slug} page`} className="space-y-5 rounded-xl border border-navy/15 bg-white p-5 sm:p-7">
    <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold capitalize">{page.slug}</h2><a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="min-h-11 py-3 text-sm font-semibold underline underline-offset-4">View public page ↗</a></div>
    <input type="hidden" name="slug" value={page.slug} />
    <label className="block text-sm font-semibold">Title<input name="title" defaultValue={page.title} required minLength={2} maxLength={191} aria-invalid={Boolean(state.errors?.title)} aria-describedby={`${page.slug}-title-error`} className={input} /><span id={`${page.slug}-title-error`} className="mt-1 block text-red-700">{state.errors?.title?.join(" ")}</span></label>
    <label className="block text-sm font-semibold">Content<textarea name="content" defaultValue={page.content} required minLength={20} maxLength={10000} rows={14} aria-invalid={Boolean(state.errors?.content)} aria-describedby={`${page.slug}-content-help ${page.slug}-content-error`} className={`${input} resize-y font-normal leading-7`} /><span id={`${page.slug}-content-help`} className="mt-2 block text-xs font-normal leading-6 text-slate">Plain text only. Separate paragraphs with a blank line. Saving publishes immediately. Confirm contact details and privacy commitments before publishing.</span><span id={`${page.slug}-content-error`} className="mt-1 block text-red-700">{state.errors?.content?.join(" ")}</span></label>
    <button disabled={pending} className="min-h-12 rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/85 focus-visible:outline-2 focus-visible:outline-gold disabled:opacity-50">{pending ? "Saving…" : "Save page"}</button>
  </form>;
}
