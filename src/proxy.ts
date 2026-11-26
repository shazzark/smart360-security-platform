import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/src/lib/auth/token";

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
  const development = process.env.NODE_ENV === "development";
  // Sonner first appends an empty style tag, then its fixed CSS. Hash both exact contents.
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}; script-src-attr 'none'; style-src 'self' ${development ? "'unsafe-inline'" : `'nonce-${nonce}' 'sha256-${process.env.SONNER_STYLE_HASH}' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='`}; style-src-attr 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; font-src 'self'; connect-src 'self'${development ? " ws: wss:" : ""}; object-src 'none'; base-uri 'self'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'${!development && process.env.SITE_URL?.startsWith("https://") ? "; upgrade-insecure-requests" : ""}`;
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const admin = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/");
  const loginPage = request.nextUrl.pathname === "/admin/login";
  const validSignature = !admin || loginPage || await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  // This is an optimistic signature check. Protected pages also verify the database session and role.
  const response = validSignature ? NextResponse.next({ request: { headers } }) : NextResponse.redirect(new URL("/admin/login", request.url));
  response.headers.set("Content-Security-Policy", csp);
  // Never cache HTML with a nonce, nor private responses, at a shared proxy/CDN.
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  if (admin) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = { matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|images/|robots.txt|sitemap.xml).*)"] };
