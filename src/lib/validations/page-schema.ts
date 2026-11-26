import { z } from "zod";

export const pageSlug = z.enum(["about", "contact", "privacy"]);
export const pageSchema = z.strictObject({
  slug: pageSlug,
  title: z.string().trim().min(2, "Enter a title of at least 2 characters.").max(191),
  content: z.string().trim().min(20, "Enter at least 20 characters.").max(10000, "Use no more than 10,000 characters."),
});
