import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { after, before, test } from "node:test";
import { prisma } from "../src/lib/prisma";
import { hashPassword, verifyPassword } from "../src/lib/auth/passwords";
import { issueSession, resolveSession, revokeSession, allowLoginAttempt, verifyCredentials } from "../src/lib/auth/core";
import { loginSchema } from "../src/lib/validations/auth-schema";

const id = `test-auth-${randomUUID()}`;
const email = `${id}@example.invalid`;
const password = "synthetic-auth-test-passphrase";
let local = false;
let passwordHash = "";

before(async () => {
  if (process.env.NODE_ENV === "production") throw new Error("Authentication tests require a local development database.");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL ?? "").hostname)) throw new Error("Local database required.");
  local = true;
  passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { id, email, name: "Synthetic authentication fixture", passwordHash, role: "ADMIN" } });
});

after(async () => {
  try {
    if (local) {
      await prisma.user.deleteMany({ where: { id } });
      await prisma.loginThrottle.deleteMany({ where: { key: createHash("sha256").update(`account:${email}`).digest("hex") } });
    }
  } finally { await prisma.$disconnect(); }
});

test("Argon2id verifies credentials, rejects wrong passwords and malformed login inputs", async () => {
  assert.equal(passwordHash.startsWith("$argon2id$"), true);
  assert.equal(await verifyPassword(passwordHash, password), true);
  assert.equal(await verifyPassword(passwordHash, "wrong-password"), false);
  assert.equal(Boolean(await verifyCredentials(email, password)), true);
  assert.equal(await verifyCredentials(email, "wrong-password"), null);
  assert.equal(await verifyCredentials("missing-auth-test@example.invalid", password), null);
  assert.equal(loginSchema.safeParse({ email, password, role: "ADMIN" }).success, false);
  assert.equal(loginSchema.safeParse({ email: "bad", password }).success, false);
});

test("sessions are signed, hashed, rotated and revoked server-side", async () => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  const first = await issueSession(user);
  assert.equal(Boolean(await resolveSession(first.token)), true);
  assert.equal(await resolveSession(first.token + "tampered"), null);
  assert.equal(await resolveSession("forged-cookie"), null);
  const stored = await prisma.session.findFirstOrThrow({ where: { userId: id } });
  assert.equal(stored.tokenHash.length, 64);
  assert.equal(stored.tokenHash === first.token, false);
  const second = await issueSession(user, first.token);
  assert.equal(await resolveSession(first.token), null);
  assert.equal(Boolean(await resolveSession(second.token)), true);
  await revokeSession(second.token);
  assert.equal(await resolveSession(second.token), null);
});

test("expiry, idle timeout, disablement, role and password changes end access", async () => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  const session = await issueSession(user);
  await prisma.session.updateMany({ where: { userId: id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  assert.equal(await resolveSession(session.token), null);
  await prisma.session.updateMany({ where: { userId: id }, data: { expiresAt: new Date(Date.now() + 3600000), lastSeenAt: new Date(Date.now() - 1801000) } });
  assert.equal(await resolveSession(session.token), null);
  await prisma.session.updateMany({ where: { userId: id }, data: { lastSeenAt: new Date() } });
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  assert.equal(await resolveSession(session.token), null);
  await prisma.user.update({ where: { id }, data: { isActive: true, role: "EDITOR" } });
  assert.equal(await resolveSession(session.token), null);
  await prisma.user.update({ where: { id }, data: { role: "ADMIN", passwordHash: await hashPassword("replacement-test-passphrase") } });
  assert.equal(await resolveSession(session.token), null);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
});

test("database-backed account throttling bounds repeated login attempts", async () => {
  for (let attempt = 0; attempt < 10; attempt++) assert.equal(await allowLoginAttempt(email), true);
  assert.equal(await allowLoginAttempt(email), false);
});
