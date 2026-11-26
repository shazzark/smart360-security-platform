import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Sonner injects one fixed stylesheet without a nonce. Allow that exact CSS, not arbitrary style tags.
const sonnerSource = readFileSync(require.resolve("sonner"), "utf8");
const sonnerStyle = sonnerSource.match(/__insertCSS\(("(?:[^"\\]|\\.)*")\);/);
if (!sonnerStyle?.[1]) throw new Error("Unable to determine Sonner's CSP stylesheet hash. Review the installed package.");
const sonnerStyleHash = createHash("sha256").update(JSON.parse(sonnerStyle[1]) as string).digest("base64");

const nextConfig: NextConfig = {
  env: { SONNER_STYLE_HASH: sonnerStyleHash },
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", port: "", pathname: `/${process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase() || "__unconfigured__"}/image/upload/**`, search: "" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      // HTML receives a request-specific nonce policy from proxy; this protects other responses.
      { key: "Content-Security-Policy", value: "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" },
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: "64kb",
    },
  },
  // Nonce-based CSP requires request-time HTML, including the framework scripts in its shell.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
