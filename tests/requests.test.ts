import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { prisma } from "../src/lib/prisma";
import { submitQuoteRequest, submitTrainingRequest } from "../src/actions/form-actions";
import { quoteRequestSchema, trainingRequestSchema, readRequestForm } from "../src/lib/validations/form-schemas";

const run = randomUUID();
const addresses = ["valid", "invalid", "limited"].map((name) => `${name}-${run}@example.invalid`);
const validEmail = addresses[0]!;
const invalidEmail = addresses[1]!;
const limitedEmail = addresses[2]!;
const programmeId = `test-programme-${run}`;
const serviceId = `test-service-${run}`;
const draftId = `test-draft-${run}`;
let localDatabaseVerified = false;

function form(extra: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: "Synthetic Test", email: validEmail, phone: "+234 (800) 000-0000", message: "Synthetic request used only for verification.", website: "", ...extra })) data.set(key, value);
  return data;
}

before(async () => {
  if (process.env.NODE_ENV === "production") throw new Error("Request integration tests must not run in production.");
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error("Request tests require a local development database.");
  await prisma.trainingRequest.count();
  await prisma.quoteRequest.count();
  localDatabaseVerified = true;
  await prisma.programme.create({ data: { id: programmeId, title: "Synthetic programme", slug: programmeId, summary: "Test fixture", description: "Test fixture", status: "PUBLISHED" } });
  await prisma.programme.create({ data: { id: draftId, title: "Synthetic draft", slug: draftId, summary: "Test fixture", description: "Test fixture", status: "DRAFT" } });
  await prisma.service.create({ data: { id: serviceId, title: "Synthetic service", slug: serviceId, summary: "Test fixture", description: "Test fixture", status: "PUBLISHED" } });
});

after(async () => {
  if (!localDatabaseVerified) {
    await prisma.$disconnect();
    return;
  }
  // Delete only this run's synthetic fixtures, never customer submissions or seed content.
  await prisma.trainingRequest.deleteMany({ where: { email: { in: addresses } } });
  await prisma.quoteRequest.deleteMany({ where: { email: { in: addresses } } });
  await prisma.programme.deleteMany({ where: { id: { in: [programmeId, draftId] } } });
  await prisma.service.deleteMany({ where: { id: serviceId } });
  await prisma.$disconnect();
});

test("schemas reject malformed, duplicate, file, and unexpected inputs", () => {
  assert.equal(quoteRequestSchema.safeParse(readRequestForm(form({ serviceInterest: "general" }))).success, true);
  for (const extra of [{ email: "not-an-email" }, { phone: "call me tomorrow" }, { phone: "123" }, { message: "short" }, { website: "https://bot.invalid" }, { status: "CLOSED" }]) {
    assert.equal(trainingRequestSchema.safeParse(readRequestForm(form({ programmeInterest: programmeId, ...extra }))).success, false);
  }
  const duplicate = form({ programmeInterest: programmeId });
  duplicate.append("email", validEmail);
  assert.equal(trainingRequestSchema.safeParse(readRequestForm(duplicate)).success, false);
  const file = form({ programmeInterest: programmeId });
  file.set("message", new Blob(["unexpected upload"]), "test.txt");
  assert.equal(trainingRequestSchema.safeParse(readRequestForm(file)).success, false);
});

test("actions persist normalized requests with NEW status and suppress immediate duplicates", async () => {
  const training = form({ programmeInterest: programmeId, email: validEmail.toUpperCase() });
  assert.deepEqual(await submitTrainingRequest(null, training), { success: true, message: "Request submitted" });
  assert.equal((await submitTrainingRequest(null, training)).success, true);
  const quote = form({ serviceInterest: serviceId, companyName: "Synthetic company" });
  assert.deepEqual(await submitQuoteRequest(null, quote), { success: true, message: "Request submitted" });
  assert.equal((await submitQuoteRequest(null, quote)).success, true);
  assert.equal(await prisma.trainingRequest.count({ where: { email: validEmail } }), 1);
  assert.equal(await prisma.quoteRequest.count({ where: { email: validEmail } }), 1);
  const saved = await prisma.trainingRequest.findFirstOrThrow({ where: { email: validEmail } });
  assert.equal(saved.status, "NEW");
  assert.equal(saved.phone, "+2348000000000");
  assert.equal(saved.programmeInterest, "Synthetic programme");
  const savedQuote = await prisma.quoteRequest.findFirstOrThrow({ where: { email: validEmail } });
  assert.equal(savedQuote.status, "NEW");
  assert.equal(savedQuote.serviceInterest, "Synthetic service");
  assert.equal(savedQuote.companyName, "Synthetic company");
});

test("rejected submissions and unavailable programmes create no records", async () => {
  for (const extra of [{ website: "spam" }, { phone: "bad phone" }, { status: "CLOSED" }, { programmeInterest: "missing-programme" }, { programmeInterest: draftId }]) {
    assert.equal((await submitTrainingRequest({ success: true }, form({ programmeInterest: programmeId, email: invalidEmail, ...extra }))).success, false);
  }
  assert.equal((await submitQuoteRequest(null, form({ email: invalidEmail, serviceInterest: "missing-service" }))).success, false);
  assert.equal(await prisma.trainingRequest.count({ where: { email: invalidEmail } }), 0);
  assert.equal(await prisma.quoteRequest.count({ where: { email: invalidEmail } }), 0);
});

test("database-backed quota limits each email to five quote requests in fifteen minutes", async () => {
  for (let index = 0; index < 5; index++) {
    assert.equal((await submitQuoteRequest(null, form({ email: limitedEmail, serviceInterest: "general", message: `Synthetic quota verification request number ${index}.` }))).success, true);
  }
  const blocked = await submitQuoteRequest(null, form({ email: limitedEmail, serviceInterest: "general", message: "This sixth request must not be saved." }));
  assert.equal(blocked.success, false);
  assert.match(blocked.errors?._form?.[0] ?? "", /Too many requests/);
  assert.equal(await prisma.quoteRequest.count({ where: { email: limitedEmail } }), 5);
});
