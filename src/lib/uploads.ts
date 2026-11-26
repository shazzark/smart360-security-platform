import "server-only";
import { randomBytes, createHash } from "node:crypto";
import sharp from "sharp";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { z } from "zod";
import { MAX_IMAGE_BYTES, uploadedImageSchema } from "@/src/lib/validations/image-schema";
import { cloudinaryClient } from "@/src/lib/cloudinary";

export class ImageInputError extends Error {}

export function uploadOriginAllowed(request: Request) {
  const expectedOrigin = process.env.SITE_URL || new URL(request.url).origin;
  return z.literal(new URL(expectedOrigin).origin).safeParse(request.headers.get("origin")).success;
}

export async function processImage(bytes: Buffer, mime: string) {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new ImageInputError("Choose an image no larger than 5MB.");
  try {
    const image = sharp(bytes, { limitInputPixels: 25_000_000, animated: false, failOn: "warning" });
    const metadata = await image.metadata();
    const expected = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" }[mime];
    if (!expected || metadata.format !== expected || (metadata.pages ?? 1) > 1) throw new ImageInputError("The file must be a non-animated JPEG, PNG, or WebP image.");
    // Decode and re-encode: reject disguised files and discard EXIF/GPS and appended payloads.
    const output = await image.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).toFormat(expected as "jpeg" | "png" | "webp").toBuffer();
    if (output.length > MAX_IMAGE_BYTES) throw new ImageInputError("The processed image is too large.");
    return { bytes: output, extension: expected === "jpeg" ? "jpg" : expected };
  } catch (error) {
    if (error instanceof ImageInputError) throw error;
    throw new ImageInputError("This image could not be decoded. Choose a valid JPEG, PNG, or WebP file.");
  }
}

export async function saveImage(bytes: Buffer, mime: string) {
  const image = await processImage(bytes, mime);
  const client = cloudinaryClient();
  const publicId = randomBytes(16).toString("hex");
  return new Promise<string>((resolve, reject) => {
    // folder preserves the folder/public-ID prefix in both fixed and dynamic Cloudinary accounts.
    const stream = client.uploader.upload_stream({ folder: "smart360_uploads", public_id: publicId, resource_type: "image", type: "upload", format: image.extension, overwrite: false, timeout: 45000 }, (error, result) => {
      const url = uploadedImageSchema.safeParse(result?.secure_url);
      if (error || !result || !url.success || new URL(url.data).pathname.split("/")[1] !== process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase()) return reject(new Error("Cloud image upload failed."));
      resolve(url.data);
    });
    stream.on("error", () => reject(new Error("Cloud image upload failed.")));
    stream.end(image.bytes);
  });
}

export async function storedImageExists(url: string) {
  if (!uploadedImageSchema.safeParse(url).success) return false;
  const parsed = new URL(url);
  if (parsed.pathname.split("/")[1] !== process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase()) return false;
  const publicId = parsed.pathname.match(/\/(smart360_uploads\/[a-f0-9]{32})\.(?:jpg|png|webp)$/)?.[1];
  if (!publicId) return false;
  try {
    // Resolve only a generated ID in our own account; never fetch a caller-selected remote URL.
    const image = await cloudinaryClient().api.resource(publicId, { resource_type: "image", type: "upload", timeout: 15000 });
    return image.secure_url === url && image.resource_type === "image";
  } catch { return false; }
}

export async function allowImageUpload(userId: string) {
  // Reuse the shared atomic throttle store with a separate key namespace.
  const key = createHash("sha256").update(`upload:${userId}`).digest("hex");
  const now = new Date();
  try {
    return await prisma.$transaction(async tx => {
      const row = await tx.loginThrottle.findUnique({ where: { key } });
      const active = row && row.windowStartedAt.getTime() > now.getTime() - 600000;
      if (active && row.count >= 20) return false;
      await tx.loginThrottle.upsert({ where: { key }, create: { key, count: 1, windowStartedAt: now }, update: active ? { count: { increment: 1 } } : { count: 1, windowStartedAt: now } });
      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch { return false; }
}
