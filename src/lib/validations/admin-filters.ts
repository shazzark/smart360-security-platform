import { z } from "zod";
import { CertificateStatus, RequestStatus, type Prisma } from "@prisma/client";

const search = z.string().trim().max(191, "Search must be no longer than 191 characters.").default("");
export const certificateFilters = z.strictObject({
  q: search,
  status: z.union([z.literal(""), z.enum(CertificateStatus)]).default(""),
});
export const requestFilters = z.strictObject({
  q: search,
  status: z.union([z.literal(""), z.enum(RequestStatus)]).default(""),
  type: z.enum(["all", "training", "quote"]).default("all"),
});
export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;

export function certificateWhere(filters: z.infer<typeof certificateFilters>, now = new Date()): Prisma.CertificateWhereInput {
  const day = new Date(now.toISOString().slice(0, 10) + "T00:00:00Z");
  const AND: Prisma.CertificateWhereInput[] = [];
  if (filters.q) AND.push({ OR: [{ recipientName: { contains: filters.q } }, { certificateNumber: { contains: filters.q } }] });
  // Match the effective table status: expiry is inclusive of its UTC date; revoked stays revoked.
  if (filters.status === "VALID") AND.push({ status: "VALID", OR: [{ expiryDate: null }, { expiryDate: { gte: day } }] });
  else if (filters.status === "EXPIRED") AND.push({ OR: [{ status: "EXPIRED" }, { status: "VALID", expiryDate: { lt: day } }] });
  else if (filters.status) AND.push({ status: filters.status });
  return { AND };
}

export function requestWhere(filters: z.infer<typeof requestFilters>) {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.q ? { OR: [{ name: { contains: filters.q } }, { email: { contains: filters.q } }] } : {}),
  } satisfies Prisma.TrainingRequestWhereInput & Prisma.QuoteRequestWhereInput;
}
