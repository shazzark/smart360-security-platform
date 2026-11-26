import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Image from "next/image";
import { publicImageSource } from "@/src/lib/validations/image-schema";
import { prisma } from "@/src/lib/prisma";
import PublicPageShell from "@/src/components/layout/PublicPageShell";
import { ContentNotice, LoadingContent, MockContentNotice, UnavailableContent } from "@/src/components/content/ContentNotice";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse the Smart360 gallery preview. Current illustrations are placeholders awaiting approved company and training photographs.",
  alternates: { canonical: "/gallery" },
};

async function Gallery() {
  // Read at request time so publication changes do not leave stale public content.
  await connection();
  const data = await Promise.all([
    prisma.galleryImage.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 24, select: { id: true, title: true, url: true, altText: true, caption: true } }),
    prisma.service.findMany({ where: { status: "PUBLISHED", imageUrl: { not: null } }, orderBy: { createdAt: "desc" }, take: 24, select: { id: true, title: true, imageUrl: true } }),
    prisma.programme.findMany({ where: { status: "PUBLISHED", imageUrl: { not: null } }, orderBy: { createdAt: "desc" }, take: 24, select: { id: true, title: true, imageUrl: true } }),
    prisma.blogPost.findMany({ where: { published: true, publishedAt: { lte: new Date() }, imageUrl: { not: null } }, orderBy: { createdAt: "desc" }, take: 24, select: { id: true, title: true, imageUrl: true } }),
  ]).catch(() => null);
  if (data === null) return <UnavailableContent />;
  const uploaded = [...data[1], ...data[2], ...data[3]].map(row => ({ id: row.id, title: row.title, url: row.imageUrl!, altText: row.title, caption: null }));
  const records = [...new Map([...uploaded, ...data[0]].map(row => [row.url, row])).values()].slice(0, 24);
  if (records.length === 0) return <ContentNotice>No records found.</ContentNotice>;
  return (
    <>
      <ul className="grid gap-8 sm:grid-cols-2">{records.map((image) => <li key={image.id}><figure className="overflow-hidden rounded-xl border border-navy/15 bg-white"><Image src={publicImageSource(image.url, "/images/mock-planning.svg")} alt={image.altText} width={800} height={600} unoptimized className="aspect-4/3 h-auto w-full object-cover" /><figcaption className="p-6"><h2 className="text-xl font-semibold">{image.title}</h2>{image.caption && <p className="mt-2 text-sm leading-7 text-slate">{image.caption}</p>}</figcaption></figure></li>)}</ul>
      <p className="mt-8 text-sm text-slate">Showing {records.length} published {records.length === 1 ? "record" : "records"}.</p>
    </>
  );
}

export default function Page() {
  return (
    <PublicPageShell title="Gallery" description="Explore the gallery preview. Current illustrations are placeholders, not photographs of Smart360 activities.">
      <MockContentNotice />
      <Suspense fallback={<LoadingContent />}><Gallery /></Suspense>
    </PublicPageShell>
  );
}

