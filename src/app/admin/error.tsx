"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main id="main-content" className="p-8"><h1 className="text-2xl font-semibold">Administration temporarily unavailable</h1><p className="mt-4 text-slate">Please try again. No request details are shown on this error page.</p><button onClick={reset} className="mt-6 rounded-sm bg-gold px-5 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Retry</button></main>;
}
