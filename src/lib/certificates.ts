import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

export function newCertificateNumber() { return `S360-${randomBytes(16).toString("hex").toUpperCase()}`; }

export function verificationIdentity(headers: Headers) {
  // Only enable behind a proxy that overwrites X-Real-IP and blocks direct origin access.
  if (process.env.VERIFY_TRUST_PROXY === "true") {
    const ip = headers.get("x-real-ip")?.trim();
    if (ip && isIP(ip)) return ip.toLowerCase();
  }
  // No trustworthy transport IP is exposed by Route Handlers: share a conservative bucket.
  return "unidentified-client";
}

export async function allowVerification(identity: string, now = new Date()) {
  const minute = new Date(Math.floor(now.getTime() / 60000) * 60000);
  const retryAfter = Math.max(1, Math.ceil((minute.getTime() + 60000 - now.getTime()) / 1000));
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const allowed = await prisma.$transaction(async tx => {
        for (const bucket of [{ name: "global", limit: 100 }, { name: `ip:${identity}`, limit: 5 }]) {
          const key = createHash("sha256").update(bucket.name).digest("hex");
          const entry = await tx.verificationThrottle.findUnique({ where: { key } });
          const active = entry?.windowStartedAt.getTime() === minute.getTime();
          if (active && entry.count >= bucket.limit) return false;
          await tx.verificationThrottle.upsert({ where: { key }, create: { key, count: 1, windowStartedAt: minute }, update: active ? { count: { increment: 1 } } : { count: 1, windowStartedAt: minute } });
        }
        await tx.verificationThrottle.deleteMany({ where: { windowStartedAt: { lt: new Date(minute.getTime() - 3600000) } } });
        return true;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return { allowed, retryAfter };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2034", "P2002"].includes(error.code) && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Verification unavailable.");
}

export async function lookupCertificate(certificateNumber: string, now = new Date()) {
  const row = await prisma.certificate.findUnique({ where: { certificateNumber }, select: { recipientName: true, programmeName: true, issueDate: true, expiryDate: true, status: true } });
  // Expiry is inclusive of the printed UTC date; revocation and future issuance always deny.
  const today = now.toISOString().slice(0, 10);
  if (!row || row.status !== "VALID" || row.issueDate.toISOString().slice(0, 10) > today || (row.expiryDate && row.expiryDate.toISOString().slice(0, 10) < today)) return null;
  return { recipientName: row.recipientName, programmeName: row.programmeName, issueDate: row.issueDate.toISOString().slice(0, 10) };
}
