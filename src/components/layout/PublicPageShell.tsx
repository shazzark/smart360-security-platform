import Link from "next/link";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicPageShell({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold tracking-[0.16em] text-gold">SMART360 / WEBSITE PREVIEW</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{description}</p>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          {children ?? <>
          <h2 className="text-2xl font-semibold">More information to follow</h2>
          <p className="mt-4 max-w-2xl leading-8 text-slate">This is a layout preview. Approved content and the relevant functionality will be added in the scheduled implementation phases.</p>
          <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Return to home</Link>
          </>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
