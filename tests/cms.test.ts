import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { prisma } from "../src/lib/prisma";
import { pageSchema } from "../src/lib/validations/page-schema";
import { readRequestForm } from "../src/lib/validations/form-schemas";

const slug = `test-page-${randomUUID()}`;
let local = false;
before(() => {
  if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL ?? "").hostname)) throw new Error("Local development database required.");
  local = true;
});
after(async () => {
  try { if (local) await prisma.page.deleteMany({ where: { slug } }); }
  finally { await prisma.$disconnect(); }
});

test("CMS accepts only supported pages and bounded explicit text fields", () => {
  const valid = { slug: "about", title: "About Smart360", content: "A sufficiently detailed company description." };
  assert.equal(pageSchema.safeParse(valid).success, true);
  for (const input of [{ ...valid, slug: "admin" }, { ...valid, role: "ADMIN" }, { ...valid, title: "" }, { ...valid, content: "short" }, { ...valid, content: "a".repeat(10001) }]) assert.equal(pageSchema.safeParse(input).success, false);
  const form = new FormData();
  for (const [key, value] of Object.entries(valid)) form.set(key, value);
  form.append("slug", "privacy");
  assert.equal(pageSchema.safeParse(readRequestForm(form)).success, false);
});

test("Page persistence enforces unique slugs and preserves seed edits on rerun", async () => {
  const original = { slug, title: "Synthetic CMS page", content: "Synthetic page content for database verification." };
  const created = await prisma.page.create({ data: original });
  await assert.rejects(prisma.page.create({ data: original }), { code: "P2002" });
  const edited = "Edited synthetic content with literal <script>unsafe()</script> markup.";
  await prisma.page.update({ where: { slug }, data: { content: edited } });
  await prisma.page.upsert({ where: { slug }, update: {}, create: original });
  const saved = await prisma.page.findUniqueOrThrow({ where: { slug } });
  assert.equal(saved.id, created.id);
  assert.equal(saved.content, edited);
});
