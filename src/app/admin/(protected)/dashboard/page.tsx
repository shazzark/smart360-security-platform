import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";

export const metadata: Metadata = { title: "Dashboard", description: "Private staff overview of Smart360 content and requests." };

export default async function Dashboard() {
  await requireUser(["ADMIN"]);
  const [training, quotes, posts, services, programmes] = await Promise.all([prisma.trainingRequest.count(), prisma.quoteRequest.count(), prisma.blogPost.count(), prisma.service.count(), prisma.programme.count()]);
  const stats = [{ name: "Training requests", count: training, href: "/admin/requests" }, { name: "Quote requests", count: quotes, href: "/admin/requests" }, { name: "Blog posts", count: posts, href: "/admin/blog" }, { name: "Services", count: services, href: "/admin/services" }, { name: "Programmes", count: programmes, href: "/admin/programmes" }];
  return <><p className="text-xs font-semibold tracking-widest text-slate">OVERVIEW</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Dashboard</h1><p className="mt-3 text-slate">Review enquiries and your current content catalogue.</p><div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{stats.map((stat) => <Link key={stat.name} href={stat.href} className="rounded-sm border border-navy/15 bg-white p-6 hover:border-navy/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy"><p className="text-sm text-slate">{stat.name}</p><p className="mt-4 text-4xl font-semibold">{stat.count}</p></Link>)}</div></>;
}
