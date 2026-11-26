import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { Prisma, type User } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { getDummyHash, verifyPassword } from "./passwords";
import { readSessionToken, signSessionToken, SESSION_SECONDS } from "./token";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "passwordHash" | "isActive">;

export async function allowLoginAttempt(email: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      // A shared global ceiling also bounds password hashing without trusting spoofable proxy headers.
      for (const bucket of [{ key: "all-logins", seconds: 60, limit: 30 }, { key: `account:${email}`, seconds: 900, limit: 10 }]) {
        const key = digest(bucket.key);
        const existing = await tx.loginThrottle.findUnique({ where: { key } });
        const active = existing && existing.windowStartedAt.getTime() > now.getTime() - bucket.seconds * 1000;
        if (active && existing.count >= bucket.limit) return false;
        await tx.loginThrottle.upsert({ where: { key }, create: { key, count: 1, windowStartedAt: now }, update: active ? { count: { increment: 1 } } : { count: 1, windowStartedAt: now } });
      }
      await tx.loginThrottle.deleteMany({ where: { windowStartedAt: { lt: new Date(now.getTime() - 86400000) } } });
      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch { return false; }
}

export async function verifyCredentials(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true, passwordHash: true, isActive: true } });
  const valid = await verifyPassword(user?.passwordHash ?? await getDummyHash(), password);
  return valid && user?.isActive ? user : null;
}

export async function issueSession(user: SessionUser, previousToken?: string) {
  const sid = randomBytes(32).toString("hex");
  const token = await signSessionToken(sid);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  const previousSid = await readSessionToken(previousToken);
  await prisma.$transaction(async (tx) => {
    if (previousSid) await tx.session.deleteMany({ where: { tokenHash: digest(previousSid) } });
    await tx.session.create({ data: { tokenHash: digest(sid), userId: user.id, passwordFingerprint: digest(user.passwordHash), roleAtIssue: user.role, expiresAt } });
    await tx.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  });
  return { token, expiresAt };
}

export async function resolveSession(raw: unknown) {
  const sid = await readSessionToken(raw);
  if (!sid) return null;
  try {
    const session = await prisma.session.findUnique({ where: { tokenHash: digest(sid) }, select: { id: true, expiresAt: true, lastSeenAt: true, passwordFingerprint: true, roleAtIssue: true, user: { select: { id: true, name: true, email: true, role: true, isActive: true, passwordHash: true } } } });
    const now = new Date();
    if (!session || session.expiresAt <= now || session.lastSeenAt.getTime() <= now.getTime() - 1800000 || !session.user.isActive || session.user.role !== session.roleAtIssue || digest(session.user.passwordHash) !== session.passwordFingerprint) return null;
    if (session.lastSeenAt.getTime() < now.getTime() - 60000) await prisma.session.updateMany({ where: { id: session.id }, data: { lastSeenAt: now } });
    // Return only safe staff fields; credentials and session identifiers stay server-side.
    const { id, name, email, role } = session.user;
    return { id, name, email, role };
  } catch { return null; }
}

export async function revokeSession(raw: unknown) {
  const sid = await readSessionToken(raw);
  if (sid) await prisma.session.deleteMany({ where: { tokenHash: digest(sid) } });
}
