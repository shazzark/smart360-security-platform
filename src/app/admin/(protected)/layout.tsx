import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/src/lib/auth/session";
import { logout } from "@/src/actions/auth-actions";
import AdminNavigation from "@/src/components/admin/AdminNavigation";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const links = [
    ...(user.role === "ADMIN" ? [{ href: "/admin/dashboard", label: "Dashboard" }, { href: "/admin/requests", label: "Requests" }, { href: "/admin/certificates", label: "Certificates" }] : []),
    { href: "/admin/blog", label: "Blog" }, { href: "/admin/services", label: "Services" }, { href: "/admin/programmes", label: "Programmes" }, { href: "/admin/pages", label: "Pages" },
  ];
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 flex h-screen flex-col border-r border-white/10 bg-navy text-white max-lg:relative">
        <div className="shrink-0 border-b border-white/10 px-7 py-8">
          <Link href={user.role === "ADMIN" ? "/admin/dashboard" : "/admin/services"} className="rounded-sm text-xl font-extrabold focus-visible:outline-2 focus-visible:outline-gold">SMART360<span className="text-gold">.</span></Link>
          <p className="mt-2 text-xs tracking-widest text-white/60">ADMINISTRATION</p>
        </div>
        <AdminNavigation links={links} />
        <form action={logout} className="mt-auto shrink-0 border-t border-white/10 p-4"><button className="min-h-12 w-full rounded-lg border border-white/10 px-4 py-3 text-left text-sm font-semibold text-gold transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold">Logout <span aria-hidden="true" className="float-right">↗</span></button></form>
      </aside>
      <main id="main-content" tabIndex={-1} className="w-full min-w-0 p-5 focus:outline-none sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
