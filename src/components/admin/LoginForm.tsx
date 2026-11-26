"use client";

import { useActionState, useEffect, useRef } from "react";
import { login } from "@/src/actions/auth-actions";
import type { LoginState } from "@/src/lib/validations/auth-schema";
import { toast } from "sonner";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (state.error) { toast.error(state.error); emailRef.current?.focus(); } }, [state]);
  return (
    <form action={action} aria-label="Admin sign in" className="mt-8 space-y-6">
      <fieldset disabled={pending} className="space-y-6">
        <legend className="sr-only">Staff credentials</legend>
        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold">Email address</label>
          <input ref={emailRef} id="login-email" name="email" type="email" autoComplete="username" required maxLength={191} aria-invalid={Boolean(state.error)} className="mt-2 min-h-12 w-full rounded-sm border border-navy/25 px-4 py-3 focus:border-navy focus:outline-2 focus:outline-navy/20" />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-semibold">Password</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} className="mt-2 min-h-12 w-full rounded-sm border border-navy/25 px-4 py-3 focus:border-navy focus:outline-2 focus:outline-navy/20" />
        </div>
        <button disabled={pending} className="min-h-12 w-full rounded-sm bg-gold px-5 py-3 font-semibold text-navy hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy disabled:cursor-wait disabled:opacity-60">{pending ? "Signing in…" : "Sign in"}</button>
      </fieldset>
    </form>
  );
}
