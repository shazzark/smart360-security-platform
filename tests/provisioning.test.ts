import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";
import { prisma } from "../src/lib/prisma";
import { verifyPassword } from "../src/lib/auth/passwords";

const execute = promisify(execFile);
test("one-time admin provisioning rejects weak input and never resets an existing account", async () => {
  if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL ?? "").hostname)) throw new Error("Local development database required.");
  const email = `test-provision-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString("hex");
  const run = (secret: string) => execute(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/create-admin.ts"], { env: { ...process.env, ADMIN_EMAIL: email, ADMIN_NAME: "Synthetic provisioning fixture", ADMIN_PASSWORD: secret } });
  try {
    await assert.rejects(run("short"));
    assert.equal(await prisma.user.findUnique({ where: { email } }), null);
    const result = await run(password);
    assert.match(result.stdout, /Administrator created/);
    assert.equal(result.stdout.includes(password), false);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    assert.equal(user.role, "ADMIN");
    assert.equal(await verifyPassword(user.passwordHash, password), true);
    await assert.rejects(run(randomBytes(24).toString("hex")));
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { email } })).passwordHash, user.passwordHash);
  } finally {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
});
