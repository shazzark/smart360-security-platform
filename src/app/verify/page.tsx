import type { Metadata } from "next";
import PublicPageShell from "@/src/components/layout/PublicPageShell";
import CertificateVerificationForm from "@/src/components/forms/CertificateVerificationForm";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Check the validity of a Smart360 training certificate using its unique certificate number.",
  alternates: { canonical: "/verify" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PublicPageShell title="Verify a certificate" description="Check a certificate using its unique number. Only current, valid certificates return recipient and training details."><CertificateVerificationForm /></PublicPageShell>;
}
