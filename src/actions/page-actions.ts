"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";
import { pageSchema } from "@/src/lib/validations/page-schema";
import { readRequestForm } from "@/src/lib/validations/form-schemas";
import type { AdminState } from "@/src/lib/validations/admin-schemas";

export async function updatePage(_state: AdminState, form: FormData): Promise<AdminState> {
  const user = await requireUser();
  const parsed = pageSchema.safeParse(form instanceof FormData ? readRequestForm(form) : null);
  if (!parsed.success) return { success: false, message: "Please correct the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  const { slug, title, content } = parsed.data;
  try {
    await prisma.page.update({ where: { slug }, data: { title, content } });
    console.info("admin.page.updated", { actor: user.id, slug });
  } catch { return { success: false, message: "Could not save the page. Please try again." }; }
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/pages");
  return { success: true, message: "Page updated." };
}
