import "dotenv/config";
import { z } from "zod";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/passwords";

async function main() {
  const parsed = z.strictObject({
    email: z.email().max(191).transform(value => value.toLowerCase()),
    name: z.string().trim().min(2).max(100),
    password: z.string().min(16).max(1024),
  }).safeParse({ email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME, password: process.env.ADMIN_PASSWORD });
  if (!parsed.success) throw new Error("Invalid provisioning configuration.");
  const { email, name, password } = parsed.data;
  // Deliberately create only: rerunning must never reset or elevate an existing account.
  await prisma.user.create({ data: { email, name, passwordHash: await hashPassword(password), role: "ADMIN" }, select: { id: true } });
  console.info("Administrator created. Remove the one-time ADMIN_* variables from the environment.");
}

main().catch(() => {
  console.error("Administrator not created. Check ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD (16–1024 characters), database connectivity, and whether the account already exists.");
  process.exitCode = 1;
}).finally(async () => { await prisma.$disconnect(); });
