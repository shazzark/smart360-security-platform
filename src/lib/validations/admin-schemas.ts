import { z } from "zod";
import { uploadedImageSchema } from "./image-schema";

export const contentKind = z.enum(["services", "programmes", "blog"]);
export const contentSchema = z.strictObject({
  kind: contentKind,
  title: z.string().trim().min(2).max(191),
  description: z.string().trim().min(10).max(10000),
  imageUrl: z.union([z.literal(""), uploadedImageSchema]).default(""),
});
export const deleteContentSchema = z.strictObject({ kind: contentKind, id: z.string().min(1).max(191) });
export const certificateLookupSchema = z.strictObject({
  certificateNumber: z.string().trim().toUpperCase().regex(/^S360-[A-F0-9]{32}$/, "Enter a complete certificate number (S360- followed by 32 letters/numbers)."),
});
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.").refine(value => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Enter a valid date.");
export const certificateSchema = z.strictObject({
  recipientName: z.string().trim().min(2).max(100),
  programmeName: z.string().trim().min(2).max(191),
  issueDate: date,
  expiryDate: z.union([z.literal(""), date]),
}).refine(value => value.issueDate <= new Date().toISOString().slice(0, 10), { path: ["issueDate"], message: "Issue date cannot be in the future." })
  .refine(value => !value.expiryDate || value.expiryDate >= value.issueDate, { path: ["expiryDate"], message: "Expiry must be on or after the issue date." });
export const revokeSchema = z.strictObject({ id: z.string().min(1).max(191) });
export type AdminState = { success: boolean; message: string; errors?: Record<string, string[] | undefined> };
