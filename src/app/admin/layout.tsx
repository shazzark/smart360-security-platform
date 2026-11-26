import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: { default: "Admin | Smart360", template: "%s | Smart360 Admin" },
  description: "Private Smart360 staff administration.",
  robots: { index: false, follow: false },
};

async function AdminRoot({ children }: { children: ReactNode }) {
  // Admin HTML needs a fresh CSP nonce and must never be prerendered with private data.
  await connection();
  return children;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<main id="main-content" className="p-8 text-slate">Loading admin…</main>}><AdminRoot>{children}</AdminRoot></Suspense>;
}
