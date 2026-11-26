"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { quoteRequestSchema, trainingRequestSchema, readRequestForm, type FormState } from "@/src/lib/validations/form-schemas";

function failure(message: string, field = "_form"): FormState {
  return { success: false, errors: { [field]: [message] } };
}

function invalid(error: z.ZodError): FormState {
  const { fieldErrors, formErrors } = z.flattenError(error);
  return { success: false, errors: { ...fieldErrors, _form: formErrors.length ? ["Please submit only the requested form fields."] : ["Please correct the highlighted fields."] } };
}

export async function submitTrainingRequest(_previousState: unknown, formData: FormData): Promise<FormState> {
  if (!(formData instanceof FormData)) return failure("Invalid form submission.");
  const parsed = trainingRequestSchema.safeParse(readRequestForm(formData));
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const programme = await tx.programme.findFirst({ where: { id: data.programmeInterest, status: "PUBLISHED" }, select: { id: true, title: true } });
      if (!programme) return failure("This programme is no longer available. Refresh and select another programme.", "programmeInterest");

      // Database-backed email quotas work across instances; serializable isolation protects concurrent checks.
      const recent = new Date(Date.now() - 15 * 60 * 1000);
      const count = await tx.trainingRequest.count({ where: { email: data.email, createdAt: { gte: recent } } });
      if (count >= 5) return failure("Too many requests. Please wait 15 minutes before trying again.");

      const duplicate = await tx.trainingRequest.findFirst({ where: { email: data.email, name: data.name, phone: data.phone, programmeId: programme.id, message: data.message, createdAt: { gte: new Date(Date.now() - 60 * 1000) } }, select: { id: true } });
      if (!duplicate) await tx.trainingRequest.create({ data: { name: data.name, email: data.email, phone: data.phone, programmeId: programme.id, programmeInterest: programme.title, message: data.message }, select: { id: true } });
      return { success: true, message: "Request submitted" };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch {
    return failure("We could not save your request. Please try again shortly.");
  }
}

export async function submitQuoteRequest(_previousState: unknown, formData: FormData): Promise<FormState> {
  if (!(formData instanceof FormData)) return failure("Invalid form submission.");
  const parsed = quoteRequestSchema.safeParse(readRequestForm(formData));
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const service = data.serviceInterest === "general" ? null : await tx.service.findFirst({ where: { id: data.serviceInterest, status: "PUBLISHED" }, select: { id: true, title: true } });
      if (data.serviceInterest !== "general" && !service) return failure("This service is no longer available. Refresh and select another service.", "serviceInterest");

      const recent = new Date(Date.now() - 15 * 60 * 1000);
      const count = await tx.quoteRequest.count({ where: { email: data.email, createdAt: { gte: recent } } });
      if (count >= 5) return failure("Too many requests. Please wait 15 minutes before trying again.");

      const companyName = data.companyName || null;
      const serviceId = service?.id ?? null;
      const duplicate = await tx.quoteRequest.findFirst({ where: { email: data.email, name: data.name, phone: data.phone, companyName, serviceId, message: data.message, createdAt: { gte: new Date(Date.now() - 60 * 1000) } }, select: { id: true } });
      if (!duplicate) await tx.quoteRequest.create({ data: { name: data.name, email: data.email, phone: data.phone, companyName, serviceId, serviceInterest: service?.title ?? "General enquiry", message: data.message }, select: { id: true } });
      return { success: true, message: "Request submitted" };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch {
    return failure("We could not save your request. Please try again shortly.");
  }
}
