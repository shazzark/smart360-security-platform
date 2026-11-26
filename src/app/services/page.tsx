import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/src/lib/prisma";
import PublicPageShell from "@/src/components/layout/PublicPageShell";
import ContentImage from "@/src/components/content/ContentImage";
import { ContentNotice, LoadingContent, MockContentNotice, UnavailableContent } from "@/src/components/content/ContentNotice";

export const metadata: Metadata = {
  title: "Our services",
  description: "Explore the Smart360 security consultancy service catalogue and submit an enquiry about your organisation's requirements.",
  alternates: { canonical: "/services" },
};

async function Services() {
  // Read at request time so publication changes do not leave stale public content.
  await connection();
  const records = await prisma.service.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 24, select: { id: true, title: true, description: true, imageUrl: true } }).catch(() => null);
  if (records === null) return <UnavailableContent />;
  if (records.length === 0) return <ContentNotice>No records found.</ContentNotice>;
  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{records.map((service) => <li key={service.id} className="group overflow-hidden rounded-xl border border-navy/15 bg-white p-4 transition-shadow duration-300 hover:shadow-lg hover:shadow-navy/5"><ContentImage src={service.imageUrl} title={service.title} /><div className="p-2 pt-5"><h2 className="text-xl font-semibold">{service.title}</h2><p className="mt-4 whitespace-pre-line leading-7 text-slate">{service.description}</p></div></li>)}</ul>
      <p className="mt-8 text-sm text-slate">Showing {records.length} published {records.length === 1 ? "record" : "records"}.</p>
    </>
  );
}

export default function Page() {
  return (
    <PublicPageShell title="Our services" description="Explore the current service catalogue. Preview records are illustrative and subject to approval.">
      <MockContentNotice />
      <Suspense fallback={<LoadingContent />}><Services /></Suspense>
    </PublicPageShell>
  );
}

