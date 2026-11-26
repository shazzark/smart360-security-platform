import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { before, after, test } from "node:test";
import { prisma } from "../src/lib/prisma";
import { allowVerification, lookupCertificate, newCertificateNumber, verificationIdentity } from "../src/lib/certificates";
import { certificateSchema, certificateLookupSchema, contentSchema } from "../src/lib/validations/admin-schemas";
import { POST } from "../src/app/api/verify/route";

const id = `test-cert-${randomUUID()}`;
const code = newCertificateNumber();
const identity = `test-ip-${randomUUID()}`;
const now = new Date();
let local = false;
before(async () => {
  if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL ?? "").hostname)) throw new Error("Local development database required.");
  local = true;
  await prisma.certificate.create({ data: { id, certificateNumber: code, recipientName: "Synthetic certificate fixture", programmeName: "Synthetic training", issueDate: new Date("2020-01-01T00:00:00Z"), expiryDate: new Date("2030-12-31T00:00:00Z") } });
});
after(async () => {
  try {
    if (local) {
      await prisma.certificate.deleteMany({ where: { id } });
      await prisma.verificationThrottle.deleteMany({ where: { key: createHash("sha256").update(`ip:${identity}`).digest("hex") } });
    }
  } finally { await prisma.$disconnect(); }
});

test("strict certificate and content boundaries reject malformed, extra and impossible inputs", () => {
  assert.equal(certificateLookupSchema.parse({ certificateNumber: code.toLowerCase() }).certificateNumber, code);
  assert.equal(certificateLookupSchema.safeParse({ certificateNumber: "*" }).success, false);
  assert.equal(certificateLookupSchema.safeParse({ certificateNumber: code, status: "VALID" }).success, false);
  const data = { recipientName: "Synthetic person", programmeName: "Synthetic programme", issueDate: "2026-02-30", expiryDate: "" };
  assert.equal(certificateSchema.safeParse(data).success, false);
  assert.equal(certificateSchema.safeParse({ ...data, issueDate: "2020-01-01", expiryDate: "2019-01-01" }).success, false);
  assert.equal(contentSchema.safeParse({ kind: "users", title: "Admin", description: "Not permitted." }).success, false);
});

test("valid lookup projects only approved fields; revoked, missing, expired and future certificates deny", async () => {
  assert.deepEqual(await lookupCertificate(code), { recipientName: "Synthetic certificate fixture", programmeName: "Synthetic training", issueDate: "2020-01-01" });
  assert.equal(await lookupCertificate(newCertificateNumber()), null);
  await prisma.certificate.update({ where: { id }, data: { status: "REVOKED" } });
  assert.equal(await lookupCertificate(code), null);
  await prisma.certificate.update({ where: { id }, data: { status: "VALID", expiryDate: new Date("2020-01-01T00:00:00Z") } });
  assert.notEqual(await lookupCertificate(code, new Date("2020-01-01T23:59:59Z")), null);
  assert.equal(await lookupCertificate(code, new Date("2020-01-02T00:00:00Z")), null);
  await prisma.certificate.update({ where: { id }, data: { status: "EXPIRED", expiryDate: null } });
  assert.equal(await lookupCertificate(code), null);
  await prisma.certificate.update({ where: { id }, data: { status: "VALID", issueDate: new Date("2099-01-01T00:00:00Z") } });
  assert.equal(await lookupCertificate(code), null);
});

test("shared limiter allows five per minute, denies sixth, isolates identities and resets", async () => {
  for (let i = 0; i < 5; i++) assert.equal((await allowVerification(identity, now)).allowed, true);
  const denied = await allowVerification(identity, now);
  assert.equal(denied.allowed, false);
  assert.ok(denied.retryAfter >= 1 && denied.retryAfter <= 60);
  assert.equal((await allowVerification(identity, new Date(now.getTime() + 60000))).allowed, true);
  const headers = new Headers({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "1.2.3.4" });
  const previous = process.env.VERIFY_TRUST_PROXY;
  delete process.env.VERIFY_TRUST_PROXY;
  assert.equal(verificationIdentity(headers), "unidentified-client");
  process.env.VERIFY_TRUST_PROXY = "true";
  assert.equal(verificationIdentity(headers), "1.2.3.4");
  if (previous === undefined) delete process.env.VERIFY_TRUST_PROXY; else process.env.VERIFY_TRUST_PROXY = previous;
});

test("verification handler returns bounded safe errors and private cache headers", async () => {
  const response = await POST(new Request("http://localhost/api/verify", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }));
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { success: false, message: "Invalid request." });
});
