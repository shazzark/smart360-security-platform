import type { Metadata } from "next";
import { requireUser } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";
import { pageSlug } from "@/src/lib/validations/page-schema";
import PageEditor from "@/src/components/admin/PageEditor";

export const metadata: Metadata = { title: "Pages", description: "Manage Smart360 company, contact and privacy page content." };
export default async function Pages() {
  await requireUser();
  const pages = await prisma.page.findMany({ where: { slug: { in: pageSlug.options } }, orderBy: { slug: "asc" }, select: { slug: true, title: true, content: true } });
  return <><p className="text-xs font-bold tracking-widest text-slate">WEBSITE CONTENT</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Pages</h1><p className="mt-4 w-full leading-7 text-slate">Edit the company pages below. Changes appear on the public site as soon as you save.</p><div className="mt-8 grid w-full gap-8">{pages.map(page => <PageEditor key={page.slug} page={page} />)}{pages.length !== 3 && <p role="status">Some page records are missing. Restore the approved page records before editing.</p>}</div></>;
}
