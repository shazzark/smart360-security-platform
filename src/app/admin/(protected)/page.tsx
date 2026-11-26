import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth/session";

export default async function AdminHome() {
  const user = await requireUser();
  redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/admin/services");
}
