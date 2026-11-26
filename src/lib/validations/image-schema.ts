import { z } from "zod";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const uploadedImageSchema = z.string().max(500).regex(/^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\/v[0-9]+\/smart360_uploads\/[a-f0-9]{32}\.(jpg|png|webp)$/, "Select a successfully uploaded image.");
export const imageUploadSchema = z.strictObject({ file: z.instanceof(File)
  .refine(file => file.size > 0 && file.size <= MAX_IMAGE_BYTES, "Choose an image no larger than 5MB.")
  .refine(file => ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Choose a JPEG, PNG, or WebP image.") });

export function publicImageSource(source: string | null | undefined, fallback: string) {
  return source && (uploadedImageSchema.safeParse(source).success || /^\/images\/[a-z0-9-]+\.svg$/.test(source)) ? source : fallback;
}
