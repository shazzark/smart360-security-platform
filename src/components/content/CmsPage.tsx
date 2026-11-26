import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import PublicPageShell from "@/src/components/layout/PublicPageShell";
import { UnavailableContent } from "@/src/components/content/ContentNotice";

export default async function CmsPage({ slug, description }: { slug: "about" | "contact" | "privacy"; description: string }) {
  const page = await prisma.page.findUnique({ where: { slug }, select: { title: true, content: true } }).catch(() => undefined);
  if (page === null) notFound();
  if (!page) return <PublicPageShell title="Information temporarily unavailable" description={description}><UnavailableContent /></PublicPageShell>;
  // CMS text is escaped by React; HTML is never interpreted as executable markup.
  return <PublicPageShell title={page.title} description={description}><article className="max-w-3xl space-y-7">{page.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className="whitespace-pre-line text-lg leading-8 text-slate wrap-anywhere">{paragraph}</p>)}</article></PublicPageShell>;
}
