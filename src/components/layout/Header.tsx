"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Training", href: "/programmes" },
  { label: "Blog", href: "/blog" },
  { label: "Verify Certificate", href: "/verify" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 80);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <motion.header initial={false} animate={{ y: scrolled && !reducedMotion ? [-12, 0] : 0 }} transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }} data-scrolled={scrolled} onKeyDown={(event) => {
      if (open && event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }} className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300 motion-reduce:transition-none ${scrolled ? "border-navy/10 bg-white/90 shadow-lg shadow-navy/5 backdrop-blur-xl" : "border-navy/10 bg-paper"}`}>
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-[padding] duration-300 motion-reduce:transition-none sm:px-8 lg:gap-6 ${scrolled ? "py-3" : "py-5"}`}>
        <Link href="/" aria-label="Smart360 Security Consultancy home" onClick={() => setOpen(false)} className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">
          <span className="block text-2xl font-extrabold tracking-tight">SMART<span className="text-slate">360</span><span className="text-gold">.</span></span>
          <span className="block text-[0.625rem] font-semibold tracking-[0.16em] text-slate">SECURITY CONSULTANCY</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:flex">
          {navigation.map(({ label, href }) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`rounded-sm py-2 text-sm font-medium underline-offset-8 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy ${pathname === href ? "text-navy underline decoration-gold decoration-2" : "text-slate"}`}>{label}</Link>
          ))}
        </nav>
        <Link href="/request-quote" className="ml-auto hidden min-h-11 items-center justify-center rounded-sm bg-gold px-5 py-3 text-sm font-bold text-navy hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy sm:inline-flex xl:ml-0">Request Quote <span aria-hidden="true" className="ml-3">↗</span></Link>
        <button ref={toggleRef} type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-navy/20 text-navy hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy xl:hidden">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">{open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg>
        </button>
      </div>
      <nav id="mobile-navigation" aria-label="Mobile navigation" hidden={!open} className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-navy/10 bg-white/95 px-5 py-4 sm:px-8 xl:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          {navigation.map(({ label, href }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)} className={`rounded-sm px-3 py-3 text-base font-medium hover:bg-paper focus-visible:outline-2 focus-visible:outline-navy ${pathname === href ? "bg-paper text-navy" : "text-slate"}`}>{label}</Link>)}
          <Link href="/request-quote" onClick={() => setOpen(false)} className="mt-3 rounded-sm bg-gold px-4 py-3 text-center font-bold text-navy hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Request Quote ↗</Link>
        </div>
      </nav>
    </motion.header>
  );
}
