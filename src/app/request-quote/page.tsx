import type { Metadata } from "next";
import PublicPageShell from "@/src/components/layout/PublicPageShell";
import { Suspense } from "react";
import { QuoteRequestSection } from "@/src/components/forms/RequestSections";
import { LoadingContent } from "@/src/components/content/ContentNotice";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Request a quote from Smart360 Security Consultancy. Share your service interests and requirements using our enquiry form.",
  alternates: { canonical: "/request-quote" },
};

export default function Page() {
  return (
    <PublicPageShell title="Request a quote" description="Tell us about your requirements. Our team can review your enquiry and discuss the next steps.">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold">How can we support your organisation?</h2>
        <Suspense fallback={<LoadingContent />}><QuoteRequestSection /></Suspense>
      </div>
    </PublicPageShell>
  );
}
