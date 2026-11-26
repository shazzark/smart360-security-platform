import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/src/components/admin/LoginForm";
import { currentUser } from "@/src/lib/auth/session";

export const metadata: Metadata = { title: "Sign in", description: "Secure staff sign in for Smart360 administration." };

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/admin/services");
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-5 py-12">
      <section aria-labelledby="login-title" className="w-full max-w-md rounded-sm border border-navy/15 bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="rounded-sm text-xl font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">SMART360<span className="text-gold">.</span></Link>
        <p className="mt-8 text-xs font-semibold tracking-widest text-slate">STAFF ACCESS</p>
        <h1 id="login-title" className="mt-3 text-3xl font-semibold tracking-tight">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-slate">Sign in to manage Smart360 content and enquiries.</p>
        <LoginForm />
      </section>
    </main>
  );
}
