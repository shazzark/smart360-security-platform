"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavigation({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return <nav aria-label="Admin navigation" className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-5">{links.map(link => {
    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
    return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-gold ${active ? "border-gold/30 bg-gold/10 text-gold" : "border-transparent text-white/70 hover:bg-white/7 hover:text-white"}`}><span aria-hidden="true" className={`size-1.5 rounded-full ${active ? "bg-gold" : "bg-white/25"}`} />{link.label}</Link>;
  })}</nav>;
}
