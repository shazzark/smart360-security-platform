"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitQuoteRequest, submitTrainingRequest } from "@/src/actions/form-actions";
import type { FormState } from "@/src/lib/validations/form-schemas";
import { useActionToast } from "@/src/components/feedback/useActionToast";

type Option = { id: string; title: string };
const initialState: FormState = { success: false };
const inputStyle = "mt-2 min-h-12 w-full rounded-sm border bg-white px-4 py-3 text-base text-navy outline-none placeholder:text-slate/70 focus:border-navy focus:ring-2 focus:ring-navy/20 disabled:bg-paper";

export default function RequestForm({ kind, options }: { kind: "quote" | "training"; options: Option[] }) {
  const isQuote = kind === "quote";
  const [state, action, pending] = useActionState(isQuote ? submitQuoteRequest : submitTrainingRequest, initialState);
  const [values, setValues] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  useActionToast(state, "Your enquiry has been saved. This is not a confirmed booking or quotation.");
  const interest = isQuote ? "serviceInterest" : "programmeInterest";
  const fields = [
    { name: "name", label: "Full name", type: "text", autoComplete: "name", maxLength: 100 },
    { name: "email", label: "Email address", type: "email", autoComplete: "email", maxLength: 254 },
    { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", maxLength: 32 },
    ...(isQuote ? [{ name: "companyName", label: "Company name (optional)", type: "text", autoComplete: "organization", maxLength: 191 }] : []),
  ];

  useEffect(() => {
    if (state.errors) formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  function error(name: string) {
    const messages = state.errors?.[name];
    return messages?.length ? <p id={`${kind}-${name}-error`} className="mt-2 text-sm leading-6 text-red-700">{messages.join(" ")}</p> : null;
  }

  return (
    <form ref={formRef} action={action} noValidate aria-label={isQuote ? "Quote request" : "Training request"} className="rounded-sm border border-navy/15 bg-white p-5 sm:p-8">

      <fieldset disabled={pending || state.success} className="min-w-0 space-y-6 disabled:opacity-70">
        <legend className="sr-only">{isQuote ? "Quote request details" : "Training request details"}</legend>
        <p className="text-sm leading-6 text-slate">All fields are required unless marked optional. Please use a phone number with 7–15 digits, including a country code if applicable.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          {fields.map((field) => <div key={field.name}>
            <label htmlFor={`${kind}-${field.name}`} className="block text-sm font-semibold">{field.label}</label>
            <input id={`${kind}-${field.name}`} name={field.name} type={field.type} autoComplete={field.autoComplete} maxLength={field.maxLength} required={field.name !== "companyName"} value={values[field.name] ?? ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} aria-invalid={Boolean(state.errors?.[field.name]?.length)} aria-describedby={state.errors?.[field.name]?.length ? `${kind}-${field.name}-error` : undefined} className={`${inputStyle} ${state.errors?.[field.name]?.length ? "border-red-700" : "border-navy/25"}`} />
            {error(field.name)}
          </div>)}
        </div>
        <div>
          <label htmlFor={`${kind}-${interest}`} className="block text-sm font-semibold">{isQuote ? "Service of interest" : "Programme of interest"}</label>
          <select id={`${kind}-${interest}`} name={interest} required value={values[interest] ?? ""} onChange={(event) => setValues({ ...values, [interest]: event.target.value })} aria-invalid={Boolean(state.errors?.[interest]?.length)} aria-describedby={state.errors?.[interest]?.length ? `${kind}-${interest}-error` : undefined} className={`${inputStyle} ${state.errors?.[interest]?.length ? "border-red-700" : "border-navy/25"}`}>
            <option value="">{isQuote ? "Select a service" : "Select a programme"}</option>
            {isQuote && <option value="general">General enquiry / not sure yet</option>}
            {options.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}
          </select>
          {error(interest)}
        </div>
        <div>
          <label htmlFor={`${kind}-message`} className="block text-sm font-semibold">How can we help?</label>
          <p id={`${kind}-message-help`} className="mt-1 text-sm leading-6 text-slate">Give a brief outline of your requirements (10–3,000 characters).</p>
          <textarea id={`${kind}-message`} name="message" required maxLength={3000} rows={5} value={values.message ?? ""} onChange={(event) => setValues({ ...values, message: event.target.value })} aria-invalid={Boolean(state.errors?.message?.length)} aria-describedby={`${kind}-message-help${state.errors?.message?.length ? ` ${kind}-message-error` : ""}`} className={`${inputStyle} resize-y ${state.errors?.message?.length ? "border-red-700" : "border-navy/25"}`} />
          {error("message")}
        </div>
        <div hidden aria-hidden="true">
          <label htmlFor={`${kind}-website`}>Leave this field empty</label>
          <input id={`${kind}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <p className="text-sm leading-6 text-slate">We use your contact details to respond to this enquiry. Do not include passwords, identity documents, or sensitive security information.</p>
        <button type="submit" disabled={pending || state.success} className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-gold px-6 py-3 font-semibold text-navy hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">{pending ? "Submitting…" : state.success ? "Submitted" : isQuote ? "Submit quote request" : "Submit training request"}</button>
      </fieldset>
    </form>
  );
}
