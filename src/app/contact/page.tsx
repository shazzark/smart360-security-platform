import type { Metadata } from "next";
import CmsPage from "@/src/components/content/CmsPage";

export const metadata: Metadata = {
  title: "Contact Smart360",
  description: "Contact Smart360 about security consultancy and training, or start an enquiry using our quote and programme request forms.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <CmsPage slug="contact" description="Start a conversation about your organisation's security and training needs." />;
}
