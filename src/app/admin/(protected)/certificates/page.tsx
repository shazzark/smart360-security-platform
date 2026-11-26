import type { Metadata } from "next";
import { requireUser } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";
import AdminTable from "@/src/components/admin/AdminTable";
import TableFilters from "@/src/components/admin/TableFilters";
import { CertificateForm, RecordButton } from "@/src/components/admin/ManagementForms";
import { certificateFilters, certificateWhere, type AdminSearchParams } from "@/src/lib/validations/admin-filters";

export const metadata: Metadata = { title: "Certificates", description: "Private administrator certificate issuance and revocation." };
export default async function Page({ searchParams }: { searchParams: AdminSearchParams }) {
  await requireUser(["ADMIN"]);
  const parsed = certificateFilters.safeParse(await searchParams);
  const filters = parsed.success ? parsed.data : certificateFilters.parse({});
  const heading = <><h1 className="text-3xl font-semibold tracking-tight">Certificates</h1><CertificateForm /><p className="mb-6 text-sm text-slate">Latest 50 matching certificates. Expiry dates remain valid through the printed UTC day. Revocation takes effect immediately. Status filters include date-based expiry.</p><TableFilters key={JSON.stringify(filters)} kind="certificates" {...filters} invalid={!parsed.success} /></>;
  if (!parsed.success) return heading;
  const now = new Date();
  const rows = await prisma.certificate.findMany({ where: certificateWhere(filters, now), take: 50, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true, certificateNumber: true, recipientName: true, programmeName: true, issueDate: true, expiryDate: true, status: true } });
  const today = now.toISOString().slice(0, 10);
  return <>{heading}<p className="mb-4 text-sm text-slate">Showing {rows.length} matching {rows.length === 1 ? "record" : "records"}</p><AdminTable label="Certificates" columns={["Number", "Recipient", "Programme", "Issued", "Expires", "Status", "Actions"]} rows={rows.map(row => ({ id: row.id, cells: [row.certificateNumber, row.recipientName, row.programmeName, row.issueDate.toISOString().slice(0, 10), row.expiryDate?.toISOString().slice(0, 10) ?? "No expiry", row.status === "VALID" && row.expiryDate && row.expiryDate.toISOString().slice(0, 10) < today ? "EXPIRED" : row.status, row.status !== "REVOKED" ? <RecordButton key={row.id} id={row.id} revoke /> : "Revoked"] }))} /></>;
}