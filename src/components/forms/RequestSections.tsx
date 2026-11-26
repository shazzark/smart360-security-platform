import { connection } from "next/server";
import { prisma } from "@/src/lib/prisma";
import RequestForm from "./RequestForm";
import { ContentNotice, UnavailableContent } from "@/src/components/content/ContentNotice";

export async function QuoteRequestSection() {
  await connection();
  const options = await prisma.service.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 100, select: { id: true, title: true } }).catch(() => null);
  if (!options) return <UnavailableContent />;
  return <RequestForm kind="quote" options={options} />;
}

export async function TrainingRequestSection() {
  await connection();
  const options = await prisma.programme.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 100, select: { id: true, title: true } }).catch(() => null);
  return (
    <section id="request-training" aria-labelledby="training-request-heading" className="mt-16 border-t border-navy/15 pt-12">
      <h2 id="training-request-heading" className="text-3xl font-semibold tracking-tight">Request training</h2>
      <p className="mt-4 mb-8 max-w-2xl leading-7 text-slate">Tell us which programme interests you and what your team needs. Submitting an enquiry does not reserve a place or confirm a fee.</p>
      {options === null ? <UnavailableContent /> : options.length === 0 ? <ContentNotice>No programmes are currently available for enquiries.</ContentNotice> : <RequestForm kind="training" options={options} />}
    </section>
  );
}
