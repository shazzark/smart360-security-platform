import { z } from "zod";
import { currentUser } from "@/src/lib/auth/session";
import { allowImageUpload, ImageInputError, saveImage, uploadOriginAllowed } from "@/src/lib/uploads";
import { imageUploadSchema, MAX_IMAGE_BYTES } from "@/src/lib/validations/image-schema";

export const runtime = "nodejs";
export const maxDuration = 60;
const reply = (body: unknown, status = 200, extra = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return reply({ error: "Sign in to upload images." }, 401);
    if (!["ADMIN", "EDITOR"].includes(user.role)) return reply({ error: "Access denied." }, 403);
    if (!uploadOriginAllowed(request)) return reply({ error: "Invalid request origin." }, 403);
    if (new URL(request.url).search || !z.string().regex(/^multipart\/form-data;\s*boundary=.+$/i).safeParse(request.headers.get("content-type")).success) return reply({ error: "Use an image upload form." }, 400);
    if (!await allowImageUpload(user.id)) return reply({ error: "Upload limit reached. Try again in 10 minutes." }, 429, { "Retry-After": "600" });
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Choose an image." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES + 65536) { await reader.cancel(); return reply({ error: "Choose an image no larger than 5MB." }, 413); }
      chunks.push(value);
    }
    let form: FormData;
    try { form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData(); }
    catch { return reply({ error: "Invalid upload form." }, 400); }
    const entries: Record<string, unknown> = Object.create(null);
    for (const [key, value] of form.entries()) entries[key] = Object.hasOwn(entries, key) ? [entries[key], value] : value;
    const result = imageUploadSchema.safeParse(entries);
    if (!result.success) return reply({ error: result.error.issues[0]?.message ?? "Choose one JPEG, PNG, or WebP image." }, 400);
    // Decode and re-encode before sending the validated buffer to signed Cloudinary storage.
    const url = await saveImage(Buffer.from(await result.data.file.arrayBuffer()), result.data.file.type);
    console.info("admin.image.uploaded", { actor: user.id });
    return reply({ url });
  } catch (error) {
    return error instanceof ImageInputError ? reply({ error: error.message }, 400) : reply({ error: "Image upload is temporarily unavailable." }, 503);
  }
}
