"use server";

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/src/lib/auth/session";
import { prisma } from "@/src/lib/prisma";
import { newCertificateNumber } from "@/src/lib/certificates";
import { storedImageExists } from "@/src/lib/uploads";
import { readRequestForm } from "@/src/lib/validations/form-schemas";
import { certificateSchema, contentSchema, deleteContentSchema, revokeSchema, type AdminState } from "@/src/lib/validations/admin-schemas";

function failure(error: unknown): AdminState {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") return { success: false, message: "This record has enquiries attached and cannot be deleted." };
  return { success: false, message: "Could not save the change. Please try again." };
}
function refresh(kind: string) {
  revalidatePath(`/admin/${kind}`);
  revalidatePath(`/${kind}`);
  revalidatePath("/admin/dashboard");
}

export async function addContent(_state: AdminState, form: FormData): Promise<AdminState> {
  const user = await requireUser();
  const parsed = contentSchema.safeParse(form instanceof FormData ? readRequestForm(form) : null);
  if (!parsed.success) return { success: false, message: "Please correct the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  const { kind, title, description, imageUrl } = parsed.data;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120) || "content"}-${randomBytes(8).toString("hex")}`;
  try {
    if (imageUrl && !await storedImageExists(imageUrl)) return { success: false, message: "Upload an image before publishing.", errors: { imageUrl: ["The uploaded image was not found."] } };
    let id: string;
    // Plain text is escaped by React. New content is explicitly published on submission.
    if (kind === "blog") id = (await prisma.blogPost.create({ data: { title, slug, imageUrl: imageUrl || null, content: description, excerpt: description.slice(0, 500), published: true, publishedAt: new Date() }, select: { id: true } })).id;
    else if (kind === "services") id = (await prisma.service.create({ data: { title, slug, imageUrl: imageUrl || null, description, summary: description.slice(0, 500), status: "PUBLISHED" }, select: { id: true } })).id;
    else id = (await prisma.programme.create({ data: { title, slug, imageUrl: imageUrl || null, description, summary: description.slice(0, 500), status: "PUBLISHED" }, select: { id: true } })).id;
    console.info("admin.content.created", { actor: user.id, kind, target: id });
  } catch (error) { return failure(error); }
  refresh(kind);
  revalidatePath("/gallery");
  return { success: true, message: "Content published." };
}

export async function deleteContent(_state: AdminState, form: FormData): Promise<AdminState> {
  const user = await requireUser();
  const parsed = deleteContentSchema.safeParse(form instanceof FormData ? readRequestForm(form) : null);
  if (!parsed.success) return { success: false, message: "Invalid deletion request." };
  const { kind, id } = parsed.data;
  try {
    if (kind === "blog") await prisma.blogPost.delete({ where: { id } });
    else if (kind === "services") await prisma.service.delete({ where: { id } });
    else await prisma.programme.delete({ where: { id } });
    console.info("admin.content.deleted", { actor: user.id, kind, target: id });
  } catch (error) { return failure(error); }
  refresh(kind);
  revalidatePath("/gallery");
  return { success: true, message: "Content deleted." };
}

export async function addCertificate(_state: AdminState, form: FormData): Promise<AdminState> {
  const user = await requireUser(["ADMIN"]);
  const parsed = certificateSchema.safeParse(form instanceof FormData ? readRequestForm(form) : null);
  if (!parsed.success) return { success: false, message: "Please correct the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  const { recipientName, programmeName, issueDate, expiryDate } = parsed.data;
  try {
    const row = await prisma.certificate.create({ data: { certificateNumber: newCertificateNumber(), recipientName, programmeName, issueDate: new Date(`${issueDate}T00:00:00Z`), expiryDate: expiryDate ? new Date(`${expiryDate}T00:00:00Z`) : null }, select: { id: true } });
    console.info("admin.certificate.created", { actor: user.id, target: row.id });
  } catch (error) { return failure(error); }
  revalidatePath("/admin/certificates");
  return { success: true, message: "Certificate issued. Copy its generated number from the table below." };
}

export async function revokeCertificate(_state: AdminState, form: FormData): Promise<AdminState> {
  const user = await requireUser(["ADMIN"]);
  const parsed = revokeSchema.safeParse(form instanceof FormData ? readRequestForm(form) : null);
  if (!parsed.success) return { success: false, message: "Invalid revocation request." };
  try {
    await prisma.certificate.update({ where: { id: parsed.data.id }, data: { status: "REVOKED" } });
    console.info("admin.certificate.revoked", { actor: user.id, target: parsed.data.id });
  } catch (error) { return failure(error); }
  revalidatePath("/admin/certificates");
  return { success: true, message: "Certificate revoked." };
}
