import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

export const SESSION_COOKIE = "__Host-smart360_session";
export const SESSION_SECONDS = 8 * 60 * 60;
const tokenSchema = z.string().max(2048).regex(/^[\w-]+\.[\w-]+\.[\w-]+$/);
const sessionIdSchema = z.string().regex(/^[a-f0-9]{64}$/);

function secret() {
  const value = z.string().min(64).safeParse(process.env.SESSION_SECRET);
  if (!value.success) throw new Error("A strong SESSION_SECRET must be configured.");
  return new TextEncoder().encode(value.data);
}

export async function signSessionToken(sid: string): Promise<string> {
  return new SignJWT({ sid: sessionIdSchema.parse(sid) })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("smart360-admin").setAudience("smart360-admin")
    .setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(secret());
}

export async function readSessionToken(raw: unknown): Promise<string | null> {
  const parsed = tokenSchema.safeParse(raw);
  if (!parsed.success) return null;
  try {
    const { payload, protectedHeader } = await jwtVerify(parsed.data, secret(), {
      algorithms: ["HS256"], issuer: "smart360-admin", audience: "smart360-admin", requiredClaims: ["iat", "exp"],
    });
    if (protectedHeader.typ !== "JWT") return null;
    const sid = sessionIdSchema.safeParse(payload.sid);
    return sid.success ? sid.data : null;
  } catch { return null; }
}
