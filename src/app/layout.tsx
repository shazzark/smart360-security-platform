import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/src/lib/site-url";
import { connection } from "next/server";
import Notifications from "@/src/components/feedback/Notifications";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  robots: { index: Boolean(process.env.SITE_URL), follow: Boolean(process.env.SITE_URL) },
  title: { default: "Smart360 Security Consultancy", template: "%s | Smart360" },
  description: "Make informed security decisions with Smart360. Explore security consultancy and training programmes, request a tailored quote, and verify training certificates online.",
  openGraph: { type: "website", locale: "en_GB", siteName: "Smart360 Security Consultancy", title: "Smart360 Security Consultancy", description: "A clearer view. A more secure future. Explore security consultancy, purposeful training, and online certificate verification.", images: [{ url: "/images/smart360-og.png", width: 1200, height: 630, alt: "Smart360 Security Consultancy — A clearer view. A more secure future." }] },
  twitter: { card: "summary_large_image", title: "Smart360 Security Consultancy", description: "Security consultancy, training programmes and online certificate verification.", images: ["/images/smart360-og.png"] },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Static HTML would omit the fresh nonce injected by proxy into the request CSP.
  await connection();
  return (
    <html
      lang="en"
      className={`${inter.variable} min-h-full antialiased`}
    >
      <body className="min-h-screen bg-paper font-sans text-navy selection:bg-gold selection:text-navy">
        <a href="#main-content" className="sr-only fixed top-4 left-4 z-50 rounded bg-gold px-4 py-3 font-semibold text-navy focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy">Skip to content</a>
        {children}
        <Notifications />
      </body>
    </html>
  );
}
