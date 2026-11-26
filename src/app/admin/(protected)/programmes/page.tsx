import type { Metadata } from "next";
import { requireUser } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";
import AdminTable, { adminDate } from "@/src/components/admin/AdminTable";
import { ContentForm, RecordButton } from "@/src/components/admin/ManagementForms";

export const metadata: Metadata = { title: "Programmes", description: "Private staff management of Smart360 programmes." };
export default async function Page() {
  await requireUser();
  const records = await prisma.programme.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50, select: { id: true, title: true, slug: true, status: true, createdAt: true } });
  return <><h1 className="text-3xl font-semibold tracking-tight">Programmes</h1><ContentForm kind="programmes" /><p className="mt-3 mb-8 text-slate">Latest 50 records, including drafts. Deleting content is permanent; records with enquiries are protected.</p><AdminTable label="Programmes" columns={["Title", "Slug", "Status", "Created", "Actions"]} rows={records.map(row => ({ id: row.id, cells: [row.title, row.slug, row.status, adminDate(row.createdAt), <RecordButton key={row.id} id={row.id} kind="programmes" />] }))} /></>;
}
