import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/src/lib/prisma";
import PublicPageShell from "@/src/components/layout/PublicPageShell";
import ContentImage from "@/src/components/content/ContentImage";
import { ContentNotice, LoadingContent, MockContentNotice, UnavailableContent } from "@/src/components/content/ContentNotice";

export const metadata: Metadata = {
  title: "Insights & updates",
  description: "Read published articles and updates from Smart360 Security Consultancy. Preview articles are clearly identified as mock content.",
  alternates: { canonical: "/blog" },
};

async function Posts() {
  // Read at request time so publication changes do not leave stale public content.
  await connection();
  const records = await prisma.blogPost.findMany({ where: { published: true, publishedAt: { lte: new Date() } }, orderBy: [{ publishedAt: "desc" }, { id: "desc" }], take: 24, select: { id: true, title: true, excerpt: true, imageUrl: true, publishedAt: true } }).catch(() => null);
  if (records === null) return <UnavailableContent />;
  if (records.length === 0) return <ContentNotice>No records found.</ContentNotice>;
  return (
    <>
      <ul className="divide-y divide-navy/15">{records.map((post) => <li key={post.id} className="py-8 first:pt-0"><article className="grid gap-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"><ContentImage src={post.imageUrl} title={post.title} fallback="/images/mock-briefing.svg" /><div className="self-center">{post.publishedAt && <time dateTime={post.publishedAt.toISOString()} className="text-sm text-slate">{new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(post.publishedAt)}</time>}<h2 className="mt-3 text-2xl font-semibold">{post.title}</h2><p className="mt-4 leading-8 text-slate">{post.excerpt}</p></div></article></li>)}</ul>
      <p className="mt-8 text-sm text-slate">Showing {records.length} published {records.length === 1 ? "record" : "records"}.</p>
    </>
  );
}

export default function Page() {
  return (
    <PublicPageShell title="Insights & updates" description="Published articles and updates. Mock entries demonstrate the content system and are not approved advice.">
      <MockContentNotice />
      <Suspense fallback={<LoadingContent />}><Posts /></Suspense>
    </PublicPageShell>
  );
}

