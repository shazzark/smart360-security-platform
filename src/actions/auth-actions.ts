"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { loginSchema, type LoginState } from "@/src/lib/validations/auth-schema";
import { readRequestForm } from "@/src/lib/validations/form-schemas";
import { allowLoginAttempt, verifyCredentials, issueSession, revokeSession } from "@/src/lib/auth/core";
import { SESSION_COOKIE } from "@/src/lib/auth/token";

const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

export async function login(_previousState: unknown, formData: FormData): Promise<LoginState> {
  if (!(formData instanceof FormData)) return { error: "Invalid email or password." };
  const parsed = loginSchema.safeParse(readRequestForm(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  let destination = "/admin/dashboard";
  try {
    if (!await allowLoginAttempt(parsed.data.email)) return { error: "Too many attempts or login temporarily unavailable. Please try again later." };
    const user = await verifyCredentials(parsed.data.email, parsed.data.password);
    if (!user) {
      console.info("Admin login rejected.");
      return { error: "Invalid email or password." };
    }
    const store = await cookies();
    const session = await issueSession(user, store.get(SESSION_COOKIE)?.value);
    store.set(SESSION_COOKIE, session.token, { ...cookieOptions, expires: session.expiresAt });
    destination = user.role === "ADMIN" ? "/admin/dashboard" : "/admin/services";
    console.info("Admin login succeeded for staff ID:", user.id);
  } catch { return { error: "Login temporarily unavailable. Please try again later." }; }
  redirect(destination);
}

export async function logout(formData: FormData): Promise<void> {
  if (!(formData instanceof FormData) || !z.strictObject({}).safeParse(readRequestForm(formData)).success) throw new Error("Invalid logout request.");
  const store = await cookies();
  try { await revokeSession(store.get(SESSION_COOKIE)?.value); }
  catch { throw new Error("Unable to complete sign out. Please try again."); }
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  console.info("Admin session signed out.");
  redirect("/admin/login");
}
