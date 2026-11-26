# Implementation phases and delivery status

This replaces the original planning checklist with the delivered scope. Phases 0–7.5 were accepted by the owner; Phase 8 is implemented and locally verified, awaiting owner acceptance. Detailed historical commands and browser evidence are in [SESSION.md](./SESSION.md). Approval of features does not authorize deployment.

## Phase 0: Foundation — complete

- [x] Next.js App Router under src, shared components/lib/actions folders, Prisma 7/MySQL adapter and development singleton.
- [x] strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes enabled; environment template and ignored secrets.
- [x] Database-writing development health probe verified by owner; disabled in production.
- [x] Type checking and local setup checks recorded.

## Phase 1: Public shell — complete

- [x] Tailwind utilities, Inter, navy/slate/gold tokens, accessible header/footer and reachable public routes.
- [x] Desktop/mobile navigation, Escape/focus behavior and overflow checks recorded.
- [x] Metadata and responsive shell compiled; owner visual acceptance received.

## Phase 2: Content, models and public reads — complete

- [x] Services, programmes, blog and gallery models, additive migrations and repeatable local seed.
- [x] Public Server Components query published data through Prisma; blog publication dates are respected.
- [x] Empty/unavailable states, bounded listings and draft filtering implemented.
- [x] Seed, type check, build and owner page verification completed.

The delivered catalogue has list views; individual article/service detail pages, a rich-text editor and pagination controls were not part of the authorized phase tasks.

## Phase 3: Forms and requests — complete

- [x] Training/quote models, strict Zod validation and owner-authorized Server Actions with useActionState.
- [x] Honeypot, email quotas, duplicate suppression, safe errors and explicit persistence.
- [x] Valid/invalid browser submissions and MySQL persistence verified; four request integration tests recorded.
- [x] Public metadata, sitemap and robots added in the owner-authorized SEO pass.

## Phase 4: Admin authentication and dashboard — complete

- [x] Argon2id passwords, jose-signed session identifiers, revocable database sessions and RBAC.
- [x] HttpOnly/Secure/SameSite=Lax cookie, proxy signature guard and independent server-side session checks.
- [x] Private dashboard, requests and initial content lists; ADMIN-only enquiry access.
- [x] Logged-out redirect, production login/cookie attributes and Phase 3 enquiries verified; authentication tests recorded.

Request handling-status editing, staff account-management UI, public password reset and MFA are not implemented. Fresh production administrator provisioning is an operator command, separate from local mock seeding.

## Phase 5: Certificate verification and content management — complete

- [x] Certificate model, random unique numbers, local valid/revoked fixtures and ADMIN issuance/revocation.
- [x] Public POST-only exact-code lookup, generic invalid response and minimal valid response.
- [x] Shared database-backed five-per-minute verification limit plus global ceiling, fail-closed behavior and Retry-After.
- [x] Staff content add/delete, explicit publication and protection against deleting enquiry-linked catalogue records.
- [x] Browser issuance/verification/revocation, six-call rate-limit check and certificate integration tests recorded.

The CMS supports content creation/deletion; general blog/service/programme editing and certificate correction are not implemented. Per-visitor IP limits require the documented trusted deployment proxy; unidentified visitors otherwise share a safe bucket.

## Phase 6: Hardening and handover — complete locally

- [x] Production nonce CSP, HSTS, framing/nosniff/referrer/permissions headers and private response caching controls.
- [x] Custom 404/global error boundary, safe messages, complete environment template and setup/deployment runbook.
- [x] Local production build/start, headers, cookies, login and custom 404 checked; thirteen integration tests recorded at this milestone.
- [x] Native runtime issue diagnosed without weakening password hashing; compatible npm runtime verified.

Deployment-specific release gates remain in [SECURITY.md](./SECURITY.md): HTTPS/proxy validation, database/media backup restore, infrastructure restrictions, approved copy, operational ownership and staging crash recovery. No production deployment is claimed.

## Phase 6.5: Media, branding and motion — complete and owner accepted

- [x] Optional content imageUrl fields, authenticated bounded image uploads, actual-format validation/re-encoding and safe post-build image reads.
- [x] Admin upload previews, public catalogue/Gallery images and SVG fallbacks.
- [x] Branded app icon/social image, metadata, glass header, staggered features and controllable reduced-motion-aware testimonial carousel.
- [x] Sonner notifications with inline field validation retained; exact stylesheet CSP hashes.
- [x] Sixteen integration tests, build, strict typing, lint, real upload/publication and browser feedback checks recorded; owner visual acceptance received.

Testimonials remain explicitly illustrative until approved endorsements are supplied. At this milestone uploads used persistent local storage; Phase 8 supersedes that storage design with Cloudinary.

## Phase 7: Page CMS, counts, sidebar and documentation — complete locally

- [x] Regenerate Prisma Client, preserving strict checks and the existing singleton.
- [x] Add Page (unique slug, title, plain-text content), additive migration and safe local About/Contact/Privacy seed that preserves edits.
- [x] Add authenticated ADMIN/EDITOR page editors with strict Zod validation, explicit writes and public/admin path revalidation.
- [x] Fetch the three public pages from MySQL by slug; escape text and handle missing/unavailable records safely.
- [x] Show actual displayed record counts on four public listings and “No records found.” for empty results.
- [x] Dark full-height sidebar with scrollable navigation, active page indication, branding-only header and bottom logout.
- [x] Reconcile final schema and implemented security controls with the actual code; remove stale proposed features from completion claims.

### Verification criteria

- [x] Prisma generation, seven-migration current status and local seed completed.
- [x] Both CMS validation/persistence tests, strict TypeScript, warning-free lint and production build passed.
- [x] Browser counts matched 2 blog posts, 3 services, 3 programmes and 4 gallery images.
- [x] Sidebar height/scroll/logout/active link and removed duplicate identity checked.
- [x] Anonymous CMS redirect, authenticated About save, immediate public reflection, escaped HTML-shaped text and restoration verified.

Final outcomes and browser-tool limitations are recorded in [SESSION.md](./SESSION.md). Owner aesthetic acceptance remains separate from local verification.

## Next boundary

Phase 7.5 adds full-width administration forms/tables with row striping/hover states and ADMIN-only certificate/request filtering via validated URL parameters. Certificate search/status includes effective UTC expiry; request search/status/type uses the existing enums. Matching lists retain the 50-record bounds. Integration tests and production browser filtering/width measurements are recorded in [SESSION.md](./SESSION.md). No database migration or new content-management workflow is included.

## Phase 8: Cloudinary storage — complete locally

- [x] Cloudinary Node SDK installed; protected environment placeholders documented. Configuration trims copied whitespace and normalizes the case-insensitive cloud name.
- [x] Authenticated multipart handler retains validation/quota/Sharp protections and sends sanitized bytes through signed upload_stream into smart360_uploads, returning secure_url in the existing url field.
- [x] Next/Image remotePatterns, shared URL validation, asset ownership/existence checks and CSP permit approved Cloudinary delivery without exposing secrets.
- [x] Obsolete local writes, serving route and empty upload directory removed; zero local-path database references confirmed. No schema migration needed.
- [x] Production build, strict typing, upload tests, lint and real admin upload/publication verified. Cloudinary resource metadata confirmed the asset folder; Services, Programmes, Blog and Gallery each loaded the hosted image without collected CSP violations.
- [x] Synthetic rendering records and the unreferenced test asset removed after verification. Credential values remained private and the actual environment file was not changed.

Stop after Phase 8 and owner review. Deployment requires subsequent instructions. Configure Cloudinary credentials on the host and test payload/duration settings in staging; the application's 5MB limit does not override hosting limits. Contact facts and privacy/vendor approval remain owner responsibilities.
