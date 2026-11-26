import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/src/lib/prisma";
import PublicPageShell from "@/src/components/layout/PublicPageShell";
import ContentImage from "@/src/components/content/ContentImage";
import { TrainingRequestSection } from "@/src/components/forms/RequestSections";
import { ContentNotice, LoadingContent, MockContentNotice, UnavailableContent } from "@/src/components/content/ContentNotice";

export const metadata: Metadata = {
  title: "Training programmes",
  description: "Browse Smart360 training programmes and durations, then submit a training request for your team's requirements.",
  alternates: { canonical: "/programmes" },
};

async function Programmes() {
  // Read at request time so publication changes do not leave stale public content.
  await connection();
  const records = await prisma.programme.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 24, select: { id: true, title: true, description: true, imageUrl: true, duration: true, price: true, currency: true } }).catch(() => null);
  if (records === null) return <UnavailableContent />;
  if (records.length === 0) return <ContentNotice>No records found.</ContentNotice>;
  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{records.map((programme) => <li key={programme.id} className="overflow-hidden rounded-xl border border-navy/15 bg-white p-4 transition-shadow duration-300 hover:shadow-lg hover:shadow-navy/5"><ContentImage src={programme.imageUrl} title={programme.title} fallback="/images/mock-training.svg" /><div className="p-2 pt-5"><h2 className="text-xl font-semibold">{programme.title}</h2><p className="mt-4 whitespace-pre-line leading-7 text-slate">{programme.description}</p><dl className="mt-6 space-y-3 border-t border-navy/10 pt-5 text-sm"><div><dt className="font-semibold">Duration</dt><dd className="mt-1 text-slate">{programme.duration ?? "To be confirmed"}</dd></div><div><dt className="font-semibold">Fee</dt><dd className="mt-1 text-slate">{programme.price !== null && programme.currency ? programme.currency + " " + programme.price.toFixed(2) : "To be confirmed"}</dd></div></dl></div></li>)}</ul>
      <p className="mt-8 text-sm text-slate">Showing {records.length} published {records.length === 1 ? "record" : "records"}.</p>
    </>
  );
}

export default function Page() {
  return (
    <PublicPageShell title="Training programmes" description="Browse training programme information. This is a catalogue preview; no bookings or payments are collected.">
      <MockContentNotice />
      <Suspense fallback={<LoadingContent />}><Programmes /></Suspense>
      <Suspense fallback={<LoadingContent />}><TrainingRequestSection /></Suspense>
    </PublicPageShell>
  );
}

