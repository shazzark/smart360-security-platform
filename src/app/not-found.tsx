import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-6 py-16">
      <section aria-labelledby="not-found-title" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-navy/15 bg-white shadow-sm">
        <div className="bg-navy px-8 py-10 text-white sm:px-12">
          <Link href="/" className="rounded-sm text-xl font-extrabold focus-visible:outline-2 focus-visible:outline-gold">SMART360<span className="text-gold">.</span></Link>
          <p className="mt-12 text-sm font-semibold tracking-widest text-gold">404 / PAGE NOT FOUND</p>
          <h1 id="not-found-title" className="mt-4 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">Let’s get you back<br />on the right path.</h1>
        </div>
        <div className="px-8 py-9 sm:px-12">
          <p className="max-w-lg leading-7 text-slate">This page may have moved, or the address may be incorrect. You can return home or explore our services.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/" className="min-h-12 rounded-md bg-navy px-6 py-3 font-semibold text-white hover:bg-navy/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Back to home</Link>
            <Link href="/services" className="min-h-12 rounded-md border border-navy/25 px-6 py-3 font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Explore services</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
