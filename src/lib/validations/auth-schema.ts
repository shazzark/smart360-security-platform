import { z } from "zod";

export const loginSchema = z.strictObject({
  email: z.string().trim().max(191).pipe(z.email()).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(1024),
});

export type LoginState = { error?: string };
