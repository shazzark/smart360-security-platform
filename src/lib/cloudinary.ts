import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

export function cloudinaryClient() {
  const parsed = z.object({
    CLOUDINARY_CLOUD_NAME: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]+$/),
    CLOUDINARY_API_KEY: z.string().trim().min(1),
    CLOUDINARY_API_SECRET: z.string().trim().min(1),
  }).safeParse(process.env);
  if (!parsed.success) throw new Error("Cloud image storage is not configured.");
  cloudinary.config({ cloud_name: parsed.data.CLOUDINARY_CLOUD_NAME, api_key: parsed.data.CLOUDINARY_API_KEY, api_secret: parsed.data.CLOUDINARY_API_SECRET, secure: true });
  return cloudinary;
}
