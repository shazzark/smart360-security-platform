import { z } from "zod";
import { allowVerification, lookupCertificate, verificationIdentity } from "@/src/lib/certificates";
import { certificateLookupSchema } from "@/src/lib/validations/admin-schemas";

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff" };
const reply = (body: unknown, status = 200, extra = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });

export async function POST(request: Request) {
  try {
    const limit = await allowVerification(verificationIdentity(request.headers));
    if (!limit.allowed) return reply({ success: false, message: "Too many attempts. Please try again shortly." }, 429, { "Retry-After": String(limit.retryAfter) });
    if (!z.literal("application/json").safeParse(request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()).success) return reply({ success: false, message: "Use a JSON request." }, 415);
    if (new URL(request.url).search) return reply({ success: false, message: "Query parameters are not supported." }, 400);
    // Bound the streamed body too; Content-Length alone can be absent or untrustworthy.
    const reader = request.body?.getReader();
    if (!reader) return reply({ success: false, message: "Invalid request." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2048) { await reader.cancel(); return reply({ success: false, message: "Request too large." }, 413); }
      chunks.push(value);
    }
    let input: unknown;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { return reply({ success: false, message: "Invalid request." }, 400); }
    const parsed = certificateLookupSchema.safeParse(input);
    if (!parsed.success) return reply({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid certificate number." }, 400);
    const certificate = await lookupCertificate(parsed.data.certificateNumber);
    return certificate ? reply({ success: true, certificate }) : reply({ success: false, message: "Invalid or Revoked Certificate" });
  } catch { return reply({ success: false, message: "Verification is temporarily unavailable. Please try again later." }, 503); }
}
