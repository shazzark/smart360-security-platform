import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { resolveSession } from "./core";
import { SESSION_COOKIE } from "./token";

export const currentUser = cache(async () => resolveSession((await cookies()).get(SESSION_COOKIE)?.value));

export async function requireUser(roles: Role[] = ["ADMIN", "EDITOR"]) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (!roles.includes(user.role)) notFound();
  return user;
}
