import type { Metadata } from "next";
import { requireUser } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";
import AdminTable, { adminDate } from "@/src/components/admin/AdminTable";
import TableFilters from "@/src/components/admin/TableFilters";
import { requestFilters, requestWhere, type AdminSearchParams } from "@/src/lib/validations/admin-filters";

export const metadata: Metadata = { title: "Requests", description: "Private staff view of training and quote enquiries." };

export default async function Requests({ searchParams }: { searchParams: AdminSearchParams }) {
  await requireUser(["ADMIN"]);
  const parsed = requestFilters.safeParse(await searchParams);
  const filters = parsed.success ? parsed.data : requestFilters.parse({});
  const heading = <><h1 className="text-3xl font-semibold tracking-tight">Requests</h1><p className="mt-3 text-slate">Latest 50 matching enquiries of each selected type. Scroll tables horizontally when needed.</p><TableFilters key={JSON.stringify(filters)} kind="requests" {...filters} invalid={!parsed.success} /></>;
  if (!parsed.success) return heading;
  const where = requestWhere(filters);
  const [training, quotes] = await Promise.all([
    filters.type === "quote" ? Promise.resolve([]) : prisma.trainingRequest.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50, select: { id: true, name: true, email: true, phone: true, programmeInterest: true, message: true, status: true, createdAt: true } }),
    filters.type === "training" ? Promise.resolve([]) : prisma.quoteRequest.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50, select: { id: true, name: true, email: true, phone: true, companyName: true, serviceInterest: true, message: true, status: true, createdAt: true } }),
  ]);
  return <>{heading}{filters.type !== "quote" && <section aria-labelledby="training-heading" className="mt-10 w-full min-w-0"><div className="mb-5 flex flex-wrap items-baseline justify-between gap-3"><h2 id="training-heading" className="text-xl font-semibold">Training requests</h2><p className="text-sm text-slate">Showing {training.length} matching {training.length === 1 ? "record" : "records"}</p></div><AdminTable label="Training requests" columns={["Name", "Email", "Phone", "Programme", "Message", "Status", "Received"]} rows={training.map(row => ({ id: row.id, cells: [row.name, row.email, row.phone, row.programmeInterest, row.message, row.status, adminDate(row.createdAt)] }))} /></section>}{filters.type !== "training" && <section aria-labelledby="quote-heading" className="mt-10 w-full min-w-0"><div className="mb-5 flex flex-wrap items-baseline justify-between gap-3"><h2 id="quote-heading" className="text-xl font-semibold">Quote requests</h2><p className="text-sm text-slate">Showing {quotes.length} matching {quotes.length === 1 ? "record" : "records"}</p></div><AdminTable label="Quote requests" columns={["Name", "Email", "Phone", "Company", "Service", "Message", "Status", "Received"]} rows={quotes.map(row => ({ id: row.id, cells: [row.name, row.email, row.phone, row.companyName ?? "—", row.serviceInterest, row.message, row.status, adminDate(row.createdAt)] }))} /></section>}</>;
}