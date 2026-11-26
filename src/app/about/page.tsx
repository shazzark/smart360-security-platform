import type { Metadata } from "next";
import CmsPage from "@/src/components/content/CmsPage";

export const metadata: Metadata = {
  title: "About Smart360",
  description: "Discover Smart360's approach to security consultancy, training and practical preparedness for organisations and their people.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <CmsPage slug="about" description="Practical thinking. Prepared people. A clearer view of security." />;
}
