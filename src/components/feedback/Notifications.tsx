"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";

export default function Notifications() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === "/admin/login" && pathname.startsWith("/admin/") && pathname !== "/admin/login") toast.success("Signed in securely", { description: "Welcome to Smart360 administration." });
    previousPath.current = pathname;
  }, [pathname]);
  return <Toaster position="bottom-right" closeButton richColors duration={6000} visibleToasts={3} containerAriaLabel="Smart360 notifications" toastOptions={{ classNames: { toast: "rounded-xl! border-navy/15! bg-white! font-sans! text-navy! shadow-xl!", title: "font-semibold!", description: "text-slate!", success: "border-l-4! border-l-gold!", error: "border-l-4! border-l-red-600!", closeButton: "border-navy/15! bg-white! text-navy!" } }} />;
}
