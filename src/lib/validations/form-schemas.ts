import { z } from "zod";

const fields = {
  name: z.string().trim().min(2, "Enter your full name (at least 2 characters).").max(100, "Use no more than 100 characters."),
  email: z.string().trim().max(254, "Email is too long.").pipe(z.email({ error: "Enter a valid email address." })).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(32, "Phone number is too long.")
    .regex(/^\+?[0-9 ()-]+$/, "Enter a phone number using digits and an optional country code.")
    .transform((value) => value.replace(/[ ()-]/g, ""))
    .refine((value) => /^\+?[0-9]{7,15}$/.test(value), "Enter a phone number with 7 to 15 digits."),
  message: z.string().trim().min(10, "Please give us at least 10 characters of detail.").max(3000, "Use no more than 3,000 characters."),
  website: z.literal("", { error: "Unable to submit this request." }),
};

export const trainingRequestSchema = z.strictObject({
  ...fields,
  programmeInterest: z.string().trim().min(1, "Select a training programme.").max(191, "Invalid programme selection."),
});

export const quoteRequestSchema = z.strictObject({
  ...fields,
  companyName: z.string().trim().max(191, "Use no more than 191 characters.").default(""),
  serviceInterest: z.string().trim().min(1, "Select a service or a general enquiry.").max(191, "Invalid service selection."),
});

export type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

// Framework action metadata is not user input; all other fields remain subject to strict validation.
export function readRequestForm(formData: FormData): Record<string, unknown> {
  const values: Record<string, unknown> = Object.create(null);
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION_")) continue;
    values[key] = Object.hasOwn(values, key) ? [values[key], value] : value;
  }
  return values;
}
