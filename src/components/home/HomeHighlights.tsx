"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const features = [
  { title: "A complete perspective", text: "Explore security consultancy with your people, operations, and priorities in mind.", href: "/services", label: "Explore consultancy", symbol: "01" },
  { title: "Training with purpose", text: "Find a programme for your team and start a conversation about your training needs.", href: "/programmes", label: "Find a programme", symbol: "02" },
  { title: "Confidence you can check", text: "Use our online portal to check a Smart360 certificate with its unique verification number.", href: "/verify", label: "Verify a certificate", symbol: "03" },
  { title: "A direct first step", text: "Tell us what matters to your organisation through a training enquiry or quote request.", href: "/request-quote", label: "Start a conversation", symbol: "04" },
];

// Clearly marked illustrative statements until the owner supplies approved client endorsements.
const testimonials = [
  { quote: "Clarity comes first. We want security advice that connects the bigger picture to the decisions our team makes every day.", role: "Example — Operations perspective", topic: "CONSULTANCY" },
  { quote: "A useful training conversation starts with the people in the room, the challenges they face, and what they need to feel prepared.", role: "Example — Training perspective", topic: "PREPARED PEOPLE" },
  { quote: "Being able to check a certificate online makes it easier to confirm a training record when it matters.", role: "Example — Verification perspective", topic: "VERIFIABLE RECORDS" },
];

export default function HomeHighlights() {
  const reduce = useReducedMotion();
  const carouselRef = useRef<HTMLElement>(null);
  const visible = useInView(carouselRef, { amount: 0.35 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [focused, setFocused] = useState(false);
  const auto = !reduce && !paused && !interacting && !focused && visible;
  useEffect(() => {
    if (!auto) return;
    const interval = window.setInterval(() => { if (!document.hidden) setIndex(value => (value + 1) % testimonials.length); }, 8000);
    return () => window.clearInterval(interval);
  }, [auto]);
  const item = testimonials[index]!;
  return <>
    <section aria-labelledby="why-heading" className="relative overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-32 size-[32rem] rounded-full border border-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute top-0 -right-8 size-[20rem] rounded-full border border-gold/15" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.5fr] lg:gap-16">
        <motion.div initial={false} whileInView={reduce ? {} : { opacity: [0, 1], y: [28, 0] }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }} className="lg:sticky lg:top-32 lg:self-start">
          <p className="flex items-center gap-3 text-xs font-bold tracking-[0.18em] text-gold"><span aria-hidden="true" className="h-px w-8 bg-gold" />WHY CHOOSE US</p>
          <h2 id="why-heading" className="mt-6 max-w-md text-4xl leading-[1.12] font-semibold tracking-tight sm:text-5xl">One connected<br /><span className="text-gold">approach.</span></h2>
          <p className="mt-7 max-w-sm text-lg leading-8 text-white/70">A clearer path from understanding your needs to preparing your people and checking their credentials.</p>
          <Link href="/about" className="mt-8 inline-flex min-h-12 items-center gap-6 rounded-sm border-b border-gold/70 py-3 text-sm font-semibold text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">Get to know Smart360 <span aria-hidden="true">↗</span></Link>
        </motion.div>
        <motion.div initial={false} whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.14 } } }} className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {features.map(feature => <motion.article key={feature.symbol} data-feature-card variants={{ visible: { opacity: reduce ? 1 : [0, 1], y: reduce ? 0 : [44, 0], transition: { duration: 0.65, ease: "easeOut" } } }} whileHover={reduce ? {} : { y: -7 }} className="group flex min-h-72 flex-col rounded-xl border border-white/15 bg-white/5 p-7 transition-colors duration-300 hover:border-gold/45 hover:bg-white/10 motion-reduce:transition-none sm:p-8"><div className="flex items-center justify-between"><span className="font-mono text-sm text-gold">{feature.symbol} /</span><svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="size-9 text-gold/80"><path d="M16 3 27 7v9c0 6-5 10-11 13C10 26 5 22 5 16V7Z" stroke="currentColor" strokeWidth="1.3" /><path d="m11 16 3 3 7-7" stroke="currentColor" strokeWidth="1.3" /></svg></div><h3 className="mt-7 text-xl font-semibold">{feature.title}</h3><p className="mt-4 flex-1 text-sm leading-7 text-white/65">{feature.text}</p><Link href={feature.href} className="mt-7 inline-flex min-h-11 items-center gap-4 self-start rounded-sm text-sm font-semibold text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">{feature.label}<span aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">↗</span></Link></motion.article>)}
        </motion.div>
      </div>
    </section>

    <section ref={carouselRef} aria-labelledby="testimonials-heading" aria-roledescription="carousel" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }} className="overflow-hidden border-b border-navy/10 bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-5 border-b border-navy/15 pb-9 md:grid-cols-2 md:gap-12"><div><p className="text-xs font-bold tracking-[0.18em] text-slate">A SHARED PERSPECTIVE</p><h2 id="testimonials-heading" className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Client testimonials</h2></div><p className="max-w-md self-end text-sm leading-7 text-slate">Design preview: these illustrative statements are not client endorsements. Approved client testimonials will replace them before launch.</p></div>
        <div className="relative mt-10 grid gap-8 lg:grid-cols-[0.35fr_1fr] lg:gap-16">
          <div aria-hidden="true" className="hidden font-serif text-[11rem] leading-none text-gold lg:block">“</div>
          <div><div aria-live={auto ? "off" : "polite"} aria-atomic="true" className="min-h-80 sm:min-h-64"><AnimatePresence mode="wait" initial={false}><motion.figure key={index} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 1 } : { opacity: 0, y: -12 }} transition={{ duration: reduce ? 0 : 0.45 }} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${testimonials.length}`}><p className="mb-5 text-xs font-bold tracking-[0.16em] text-slate">{item.topic} / ILLUSTRATIVE FEEDBACK</p><blockquote className="max-w-3xl text-2xl leading-relaxed font-medium tracking-tight sm:text-3xl">“{item.quote}”</blockquote><figcaption className="mt-7 flex items-center gap-4"><span aria-hidden="true" className="h-px w-9 bg-gold" /><span className="text-sm text-slate">{item.role}</span></figcaption></motion.figure></AnimatePresence></div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-1">{testimonials.map((entry, position) => <button key={entry.topic} type="button" aria-label={`Show testimonial ${position + 1}`} aria-pressed={index === position} onClick={() => { setIndex(position); setPaused(true); }} className="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-navy"><span className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${index === position ? "w-7 bg-navy" : "w-2 bg-navy/25"}`} /></button>)}</div><div className="flex items-center gap-2"><button type="button" aria-label="Previous testimonial" onClick={() => { setIndex(value => (value + testimonials.length - 1) % testimonials.length); setPaused(true); }} className="size-11 rounded-full border border-navy/25 hover:bg-white focus-visible:outline-2 focus-visible:outline-navy">←</button><button type="button" aria-label="Next testimonial" onClick={() => { setIndex(value => (value + 1) % testimonials.length); setPaused(true); }} className="size-11 rounded-full border border-navy/25 hover:bg-white focus-visible:outline-2 focus-visible:outline-navy">→</button><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} className="min-h-11 rounded-sm px-3 text-sm font-semibold text-slate hover:text-navy focus-visible:outline-2 focus-visible:outline-navy motion-reduce:hidden">{paused ? "Play" : "Pause"}</button></div></div></div>
        </div>
      </div>
    </section>
  </>;
}
