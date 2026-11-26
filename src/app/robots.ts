import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // Avoid indexing a local/preview deployment before the owner configures the public origin.
  if (!process.env.SITE_URL) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/verify"] },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).href,
  };
}
