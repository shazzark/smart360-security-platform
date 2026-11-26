import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import HomeHighlights from "@/src/components/home/HomeHighlights";

export const metadata: Metadata = {
  title: { absolute: "Smart360 Security Consultancy" },
  description: "Explore Smart360 Security Consultancy, browse services and training programmes, and submit a training enquiry or request a quote.",
  alternates: { canonical: "/" },
};

const focusAreas = [
  { title: "Security consultancy", text: "Learn about our approach and explore the service catalogue once approved.", href: "/services", label: "Explore services" },
  { title: "Training programmes", text: "Discover programme information and find a starting point for your team.", href: "/programmes", label: "Explore training" },
  { title: "Certificate verification", text: "Check a Smart360 training certificate using its unique number through our verification portal.", href: "/verify", label: "Visit the portal" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <section aria-labelledby="hero-heading" className="bg-navy text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:py-28">
            <div className="min-w-0">
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-gold"><span aria-hidden="true" className="h-px w-8 shrink-0 bg-gold" />SMART360 SECURITY CONSULTANCY</p>
              <h1 id="hero-heading" className="max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl">A clearer view.<br />A more <span className="text-gold">secure future.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Explore our approach to security consultancy and training. Build your next step around the needs of your people and organisation.</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/request-quote" className="inline-flex min-h-12 items-center justify-center gap-5 rounded-sm bg-gold px-6 py-3 font-semibold text-navy hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">Request a quote <span aria-hidden="true">↗</span></Link>
                <Link href="/services" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/35 px-6 py-3 font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">Explore services</Link>
              </div>
            </div>
            <aside aria-label="Explore our focus" className="self-center border-t border-white/20 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/60">A COMPLETE PERSPECTIVE</p>
              <ol className="mt-6 divide-y divide-white/15">{["Understand your security needs", "Explore consultancy and training", "Plan your next step"].map((text, index) => <li key={text} className="flex items-start gap-5 py-5"><span className="text-sm text-gold">0{index + 1}</span><span className="text-lg font-medium">{text}</span></li>)}</ol>
              <p className="mt-5 text-xs leading-6 text-white/55">Website preview · Content subject to approval</p>
            </aside>
          </div>
        </section>

        <section aria-labelledby="services-heading" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-6 border-b border-navy/15 pb-10 md:grid-cols-2 md:gap-16">
            <div><p className="text-xs font-bold tracking-[0.16em] text-slate">OUR FOCUS</p><h2 id="services-heading" className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Prepared people.<br />Considered decisions.</h2></div>
            <p className="max-w-lg self-end text-lg leading-8 text-slate">An introduction to Smart360. Detailed services and programme information will be added following content approval.</p>
          </div>
          <div className="grid divide-y divide-navy/15 md:grid-cols-3 md:divide-x md:divide-y-0">
            {focusAreas.map(({ title, text, href, label }, index) => (
              <article key={href} className="py-8 md:px-6 md:first:pl-0 md:last:pr-0">
                <span className="text-sm font-semibold text-slate">0{index + 1} /</span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-4 text-base leading-7 text-slate">{text}</p>
                <Link href={href} className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">{label}<span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </section>

        <HomeHighlights />

        <section aria-labelledby="cta-heading" className="border-t border-navy/10 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center lg:py-16">
            <div><p className="text-xs font-bold tracking-[0.16em] text-slate">TAKE THE NEXT STEP</p><h2 id="cta-heading" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Start with a conversation.</h2><p className="mt-4 leading-7 text-slate">Tell us what matters to your organisation.</p></div>
            <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-6 rounded-sm bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Contact Smart360 <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
