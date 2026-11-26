import type { Metadata } from "next";
import CmsPage from "@/src/components/content/CmsPage";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "Learn how Smart360 handles website enquiries, staff session cookies and public certificate verification information.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <CmsPage slug="privacy" description="How information is used across this website. Operational and legal details require owner approval before launch." />;
}
