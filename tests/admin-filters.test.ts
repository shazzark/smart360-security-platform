import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { after, before, test } from "node:test";
import { prisma } from "../src/lib/prisma";
import { certificateFilters, certificateWhere, requestFilters, requestWhere } from "../src/lib/validations/admin-filters";

const prefix = `filter-${randomUUID()}`;
const name = `Synthetic ${prefix}`;
const certIds = Array.from({ length: 5 }, (_, i) => `${prefix}-cert-${i}`);
const trainingIds = [`${prefix}-training-new`, `${prefix}-training-closed`];
const quoteId = `${prefix}-quote`;
const day = new Date("2030-06-15T12:00:00Z");
let local = false;

before(async () => {
  if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL ?? "").hostname)) throw new Error("Local development database required.");
  local = true;
  const certificates = [
    { status: "VALID" as const, expiryDate: null },
    { status: "VALID" as const, expiryDate: new Date("2030-06-15T00:00:00Z") },
    { status: "VALID" as const, expiryDate: new Date("2030-06-14T00:00:00Z") },
    { status: "REVOKED" as const, expiryDate: new Date("2030-06-14T00:00:00Z") },
    { status: "EXPIRED" as const, expiryDate: new Date("2031-06-15T00:00:00Z") },
  ];
  for (const [i, certificate] of certificates.entries()) await prisma.certificate.create({ data: { id: certIds[i]!, certificateNumber: `S360-${randomBytes(16).toString("hex").toUpperCase()}`, recipientName: name, programmeName: "Synthetic filtering programme", issueDate: new Date("2029-01-01T00:00:00Z"), ...certificate } });
  await prisma.programme.create({ data: { id: prefix, slug: prefix, title: name, summary: "Synthetic fixture", description: "Synthetic fixture" } });
  for (const [i, status] of (["NEW", "CLOSED"] as const).entries()) await prisma.trainingRequest.create({ data: { id: trainingIds[i]!, name, email: `${prefix}@example.invalid`, phone: "+2348000000099", programmeId: prefix, programmeInterest: name, message: "Synthetic filter test", status } });
  await prisma.quoteRequest.create({ data: { id: quoteId, name, email: `${prefix}@example.invalid`, phone: "+2348000000099", serviceInterest: "General enquiry", message: "Synthetic filter test", status: "IN_PROGRESS" } });
});
after(async () => {
  try {
    if (local) {
      await prisma.trainingRequest.deleteMany({ where: { id: { in: trainingIds } } });
      await prisma.quoteRequest.deleteMany({ where: { id: quoteId } });
      await prisma.programme.deleteMany({ where: { id: prefix } });
      await prisma.certificate.deleteMany({ where: { id: { in: certIds } } });
    }
  } finally { await prisma.$disconnect(); }
});

test("filter schemas reject duplicate, oversized, unknown and invalid query values", () => {
  assert.deepEqual(requestFilters.parse({}), { q: "", status: "", type: "all" });
  for (const data of [{ q: ["one", "two"] }, { q: "x".repeat(192) }, { status: "PROCESSED" }, { type: "other" }, { role: "ADMIN" }]) assert.equal(requestFilters.safeParse(data).success, false);
  assert.equal(certificateFilters.safeParse({ status: "NEW" }).success, false);
});

test("certificate searches combine with effective UTC expiry and revocation precedence", async () => {
  const find = (q: string, status: "" | "VALID" | "REVOKED" | "EXPIRED") => prisma.certificate.findMany({ where: { AND: [{ id: { in: certIds } }, certificateWhere({ q, status }, day)] }, select: { id: true } });
  assert.equal((await find(name, "")).length, 5);
  assert.deepEqual((await find(name, "VALID")).map(row => row.id).sort(), [certIds[0], certIds[1]].sort());
  assert.deepEqual((await find(name, "EXPIRED")).map(row => row.id).sort(), [certIds[2], certIds[4]].sort());
  assert.deepEqual((await find(name, "REVOKED")).map(row => row.id), [certIds[3]]);
  const number = (await prisma.certificate.findUniqueOrThrow({ where: { id: certIds[0]! } })).certificateNumber;
  assert.equal((await find(number, "VALID")).length, 1);
  assert.equal((await find("no-matching-synthetic-recipient", "VALID")).length, 0);
});

test("request name/email searches and existing statuses narrow each enquiry type", async () => {
  const filters = requestFilters.parse({ q: name, status: "NEW", type: "training" });
  const training = await prisma.trainingRequest.findMany({ where: { AND: [{ id: { in: trainingIds } }, requestWhere(filters)] } });
  assert.deepEqual(training.map(row => row.id), [trainingIds[0]]);
  const quote = await prisma.quoteRequest.findMany({ where: { AND: [{ id: quoteId }, requestWhere(requestFilters.parse({ q: `${prefix}@example.invalid`, status: "IN_PROGRESS" }))] } });
  assert.equal(quote.length, 1);
  assert.equal((await prisma.quoteRequest.findMany({ where: { AND: [{ id: quoteId }, requestWhere(filters)] } })).length, 0);
});
