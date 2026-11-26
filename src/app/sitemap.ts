import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  // Only existing, indexable public pages belong here; never include private API or admin routes.
  return ["/", "/about", "/services", "/programmes", "/blog", "/gallery", "/contact", "/request-quote", "/privacy"].map((path) => ({
    url: new URL(path, siteUrl).href,
  }));
}
