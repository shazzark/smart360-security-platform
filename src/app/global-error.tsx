"use client";

import "./globals.css";
import Link from "next/link";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  // This boundary replaces the root layout. Never render the underlying error or its stack.
  return (
    <html lang="en">
      <head><title>Temporarily unavailable | Smart360</title><meta name="robots" content="noindex, nofollow" /></head>
      <body className="min-h-screen bg-paper font-sans text-navy antialiased">
        <main id="main-content" className="flex min-h-screen items-center justify-center px-6 py-16">
          <section aria-labelledby="global-error-title" className="w-full max-w-xl rounded-2xl border border-navy/15 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-xl font-extrabold">SMART360<span className="text-gold">.</span></p>
            <div className="mt-10 h-1 w-12 bg-gold" />
            <h1 id="global-error-title" className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">We’re temporarily unavailable.</h1>
            <p className="mt-5 leading-7 text-slate">We couldn’t load this page. Please try again in a moment. If you were submitting a request, check for confirmation before trying again.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={() => retry()} className="min-h-12 rounded-md bg-navy px-6 py-3 font-semibold text-white hover:bg-navy/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Try again</button>
              <Link href="/" prefetch={false} className="min-h-12 rounded-md border border-navy/25 px-6 py-3 font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Back to home</Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
