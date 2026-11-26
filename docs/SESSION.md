# Delivery Status

Latest increment: Phase 8, implemented and locally verified on 2026-11-26. Phases 0–7.5 were accepted by the owner. Deployment remains separate.

## Phase 0

The owner confirmed the database health check passed and authorized Phase 1 on 2026-11-26. The broader phase checklist remains a verification reference; this is not a claim that every future release preparation check was completed.

## Phase 1: Public Shell — 2026-11-26

Implemented Tailwind v4 navy/slate/gold tokens, Next.js self-hosted Inter, global metadata and a keyboard skip link, responsive Header and Footer, and a home shell with hero, services overview, and contact CTA. Shared destination shells keep every navigation/footer link reachable. All business copy is provisional; contact details are explicitly unconfirmed. Forms, CMS operations, and certificate lookup remain deferred to their scheduled phases.

Key files: [global tokens](../src/app/globals.css), [root layout](../src/app/layout.tsx), [home](../src/app/page.tsx), [Header](../src/components/layout/Header.tsx), [Footer](../src/components/layout/Footer.tsx), and [destination shell](../src/components/layout/PublicPageShell.tsx). No backend or database changes were made in this phase.

Verification performed:

- `npx tsc --noEmit` passed with strict settings; `npm run lint` passed.
- `npm run build` passed after retrying with network access for the Inter download. The first sandboxed attempt failed to reach Google Fonts; clean builds currently require access to that font provider.
- Browser measurements at widths 320, 375, 768, 1024, and 1440 pixels showed no horizontal overflow on the home page. Inter and Tailwind colors were confirmed through computed styles.
- Mobile menu opened with `aria-expanded=true`; Escape closed it and returned focus to the toggle; selecting About navigated and closed the menu. Desktop navigation was visible and the mobile toggle hidden at 1440 pixels.
- All nine destination shells returned HTTP 200. These are previews, not implemented forms, CMS listings, or verification workflows.

Pending: owner visual review on mobile and desktop, final brand/copy/contact approval, and broader accessibility/browser review before release. Stop here; Phase 2 has not been started.

## Phase 2: Content Models and Public Fetching — 2026-11-26

The owner verified Phase 1 and authorized the four content models, migration, mock seed, and database-backed public listings. Created `Service`, `Programme`, `BlogPost`, and `GalleryImage` through an additive local MySQL migration; preserved `HealthCheck`. See [actual schema decisions](./DATABASE_SCHEMA.md#phase-2-implementation-decisions) and [migration](../prisma/migrations/20261126042617_add_content_models/migration.sql).

Implemented [seed fixtures](../prisma/seed.ts), standard Prisma configuration discovery, and the npm seed command. Seed contents: 3 mock services, 3 mock programmes, 2 published mock posts, 1 unpublished draft, and 4 locally hosted mock gallery illustrations. Programme fees/currencies remain unconfirmed. Seed upserts preserve edited content, and no reset/delete operations were used.

The [services](../src/app/services/page.tsx), [programmes](../src/app/programmes/page.tsx), [blog](../src/app/blog/page.tsx), and [gallery](../src/app/gallery/page.tsx) listings use the existing singleton through Server Components. Each reads at request time inside Suspense, selects public fields, filters publication state, sorts deterministically, and displays at most 24 records. Empty and unavailable states are distinct; there is no shared content cache or public write API. Pagination, content detail views, and CMS editing are not part of this requested increment.

Verification:

- Prisma migration applied successfully; migration status reports both migrations applied. Explicit `npx prisma generate` succeeded.
- `npx prisma db seed` succeeded twice. The second run preserved the visible counts without duplicates. The first sandboxed seed attempt failed when tsx could not read Windows account information; rerunning outside the sandbox succeeded.
- `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `git diff --check` passed. Build output identifies all four content listings as static shells with dynamic server-streamed content.
- Restarted only the confirmed Smart360 dev server after a browser check exposed its old cached Prisma client. Server is running at `http://localhost:3000` with the regenerated client.
- Browser checks confirmed exactly 3 service headings, 3 programme headings, 2 published post headings with 2 dates, and 4 gallery images, all loaded. The seeded private draft was absent. All four pages had no horizontal overflow at 375px.

Pending: owner browser/visual verification of this increment and approved replacement content. Phase 3 has not been started.

## Phase 3: Forms & Requests — 2026-11-26

The owner verified Phase 2 and expressly authorized Server Actions for these two form submissions, overriding the earlier Route Handler-only constraint for this feature. Added request models, published-catalogue foreign keys and interest-title snapshots, strict [Zod schemas](../src/lib/validations/form-schemas.ts), [Server Actions](../src/actions/form-actions.ts), and shared [client forms](../src/components/forms/RequestForm.tsx) using `useActionState`. Forms appear on the quote page and below the programme catalogue. No admin UI, notifications, booking, or payment processing was added.

Required fields: name, email, phone, service/programme selection, and a 10–3,000-character message. Company name is optional for quotes; general enquiries do not require a particular service. Phone validation checks syntax and 7–15 digits, not ownership or reachability. Fields retain input after validation failure. Errors have red styling, accessible descriptions, and focused feedback; pending/success disables resubmission. Honeypots, body-size limits, published selection checks, email quotas, and 60-second duplicate suppression run server-side. Responses expose only success/message or validation errors, never private request rows or database details.

Migration recovery: the original `add_requests` attempt failed because MyISAM's 1,000-byte index limit rejected the email/date index. Read-only inspection confirmed neither request table existed. The corrected migration explicitly uses InnoDB and converts the two existing catalogue parent tables while preserving records. Ran `prisma migrate resolve --rolled-back 20261126043935_add_requests`, then `prisma migrate deploy`; migration status now reports all three migrations applied. No reset/drop/data-loss operation was used. Prisma Client generation succeeded.

Verification recorded:

- `npx tsc --noEmit`, `npm run lint`, and `npm run build` passed. The build renders the quote/training forms through dynamic server-streamed sections.
- `npm run test:requests` passed all four integration tests: schema rejection (malformed/duplicate/file/unknown fields), normalized persistence/NEW status/deduplication, unavailable selection and spam denial without records, and five-per-email quota enforcement. Tests use run-specific local synthetic fixtures and remove those fixtures afterward. Unused catalogue fixtures from the first failed test run were also removed.
- Browser quote test displayed the Zod email error, preserved the entered name, then succeeded after correction. Training test displayed a phone error with `aria-invalid=true`, then succeeded after correction.
- Read-only database checks confirmed one synthetic browser request in each table with `NEW` status and the correct interest-title snapshot. These two synthetic enquiry records remain available for later admin verification.
- Both forms showed no horizontal overflow at the current 375px mobile viewport. InnoDB was confirmed for both requests and their service/programme parents.

Pending: owner visual/browser verification, approved privacy/retention copy and catalogue content, and production deployment-specific abuse controls. Editor diagnostics may need a TypeScript server refresh after Prisma generation; fresh CLI type checks and production compilation passed. Stop here; Phase 4 has not been started.

## Public SEO Pass — 2026-11-26

Added explicit, page-specific titles and descriptions plus canonical URLs to all ten existing public pages, including the home page. Root metadata now supplies the shared URL base. Descriptions accurately identify provisional content rather than inventing company details or claiming certificate lookup is already live.

Created [sitemap.ts](../src/app/sitemap.ts) and [robots.ts](../src/app/robots.ts). The sitemap includes nine existing public routes; certificate verification is intentionally excluded and has `noindex, nofollow` metadata. API and future admin routes are excluded from the sitemap and disallowed by production robots rules. These crawler directives do not replace authorization.

Added [site URL validation](../src/lib/site-url.ts) and documented `SITE_URL` in [.env.example](../.env.example). Set it to the real HTTP(S) public origin before building for production, then rebuild/redeploy: metadata and these files are generated at build time. Without `SITE_URL`, canonical/sitemap URLs fall back to `http://localhost:3000`, robots disallows all crawling, and pages default to `noindex, nofollow`. No domain was invented and the owner's environment file was not modified.

Verification: `npx tsc --noEmit`, focused ESLint, `npm run build`, and `git diff --check` passed. Browser checks confirmed titles, descriptions, canonical URLs, and robots metadata on all ten pages; fetched sitemap XML contained the nine expected routes, and robots correctly returned `Disallow: /` with no production origin configured. Started the local dev server for these checks; it is available at `http://localhost:3000`.

Phase 4 was subsequently authorized and completed as recorded below.

## Phase 4: Admin Auth & Dashboard — 2026-11-26

Status: complete for the owner's requested Phase 4 scope and final verification. Phase 5 has not been started; await explicit authorization.

Implemented the User, Session, and LoginThrottle models with the additive `add_user` migration and regenerated Prisma Client. The local-only seed creates the requested administrator with an Argon2id password hash without overwriting an existing account's password. Login and logout use Server Actions as expressly authorized for Phase 4, extending the earlier forms-only exception.

Authentication uses signed tokens backed by revocable database sessions, expiry and idle limits, account throttling, and current-user/role checks. Next.js 16 uses [proxy.ts](../src/proxy.ts) in place of the older middleware convention. Protected layouts and pages repeat server-side authorization before reading private data. The separate login screen has no public Header/Footer; the protected dashboard includes requests and read-only content listings. Content editing and certificates remain deferred.

Final closeout verification:

- The existing development server was running and responded to browser checks.
- Logged out through the UI, requested `/admin/dashboard`, and confirmed redirection to `/admin/login`.
- Signed in through the UI with the requested seeded credentials and reached `/admin/dashboard`.
- Inspected the login response without recording its token: `__Host-smart360_session` has `HttpOnly`, `Secure`, and `SameSite=Lax`. Browser JavaScript could not read the session cookie.
- Opened `/admin/requests` and confirmed both tables show the retained Phase 3 synthetic submissions: Browser Training Test and Browser Quote Test, each with NEW status and the expected interest.
- Final `npx tsc --noEmit` passed with exit code 0.
- Earlier Phase 4 verification passed production build, lint, and four authentication integration tests covering credential validation, session tampering/rotation/revocation, session/account changes, and account throttling. Migration status reported all four migrations applied.

Known development observation: Next.js emitted an uncached-data/Suspense diagnostic during dashboard navigation. The dashboard and requests rendered successfully, and the prior production build passed. This closeout verifies the requested behavior; the diagnostic remains a rendering follow-up rather than a claim of fully completed release hardening.

No application code or database schema was changed during this final verification pass. Existing working-tree changes were preserved. Stop here and await the owner's Phase 5 prompt.

## Phase 5: Certificate Verification & Admin Add/Delete — 2026-11-26

The owner verified Phase 4 and authorized this increment, including Server Actions for certificate issuance/revocation and content add/delete. Implemented [Certificate and VerificationThrottle](../prisma/schema.prisma), the additive InnoDB migration `20261126070000_add_certificates`, regenerated Prisma Client, and seeded three mock certificates (two valid, one revoked). Existing seed records and content are preserved on reruns. All five migrations are applied.

The [public verification form](../src/components/forms/CertificateVerificationForm.tsx) submits exact codes to the [POST handler](../src/app/api/verify/route.ts). It uses strict Zod validation, bounded input, private non-cacheable responses, safe outage errors, and shared database quotas. Current valid certificates disclose only recipient, programme and issue date; all missing/revoked/expired results share a generic invalid message. Codes are never put in lookup URLs. Expiry is inclusive of the printed UTC day. The page remains excluded from indexing.

The [certificate admin page](../src/app/admin/(protected)/certificates/page.tsx) issues random-numbered certificates and revokes them with ADMIN checks repeated in [Server Actions](../src/actions/admin-actions.ts). Sidebar navigation includes certificates only for ADMIN. Existing blog/services/programmes listings now include simple publish forms and confirmed delete buttons for ADMIN/EDITOR. Strict input shapes prevent caller-selected roles/statuses; foreign-key restrictions preserve enquiry history. No edit, rich-text editor, media upload, certificate correction, or staff provisioning workflow was added to this requested increment.

Verification performed:

- `npx prisma generate` and `npx prisma db seed` succeeded. The seed needed the same Windows/tsx sandbox exception as earlier phases; no reset was used. Restarted the confirmed project dev-server worker to replace its old Prisma Client instance.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` passed. The build includes the certificate admin page and dynamic POST verification handler.
- All 12 integration tests passed: four certificate tests plus the existing four authentication and four request tests. Certificate tests cover strict boundaries, public projections, revoked/missing/expired/future cases, inclusive expiry boundaries, quota reset/denial, ignored untrusted headers, and safe malformed-JSON responses.
- Playwright: logged out and logged back in using the seeded administrator; issued a synthetic certificate, immediately verified its recipient/programme publicly, revoked it, and confirmed the same number immediately returned the generic invalid message. A seeded revoked number also returned that message.
- Playwright: six rapid verification requests returned 200, 200, 200, 200, 200, then 429 with `Retry-After: 29`; all responses were `no-store`.
- Playwright: added and deleted a synthetic service, programme, and blog article. The article appeared in the public blog before deletion. Deletion of the mock service linked to the Phase 3 synthetic enquiry was rejected with a safe explanation and preserved the row.
- The public verification page showed no horizontal overflow at the existing mobile viewport. Synthetic content test records were deleted; the additional synthetic certificate remains revoked for review, alongside the three seed certificates.

Deployment limitation: independent per-IP limits require a trusted proxy that overwrites `X-Real-IP` and blocks direct origin access, followed by `VERIFY_TRUST_PROXY=true`. The default local configuration safely groups unidentified callers into one five-per-minute bucket and ignores spoofable headers. See [security notes](./SECURITY.md#certificate-verification-and-abuse-prevention). Production proxy topology, comprehensive release security checks, privacy/content approval, and the existing Next.js development rendering diagnostic remain Phase 6 follow-ups; do not treat these checks as production certification.

Stop after owner testing of this increment. Phase 6 has not been started.

## Phase 6: Security Hardening, Polish & Handover — 2026-11-26

The owner verified Phase 5 and authorized the final application hardening and handover increment. The requested MVP implementation is complete; production deployment and final company-content approval remain separate launch gates.

Implemented global headers through [Next configuration](../next.config.ts) with per-request HTML CSP in [proxy](../src/proxy.ts). HSTS has a one-year lifetime without unapproved subdomain/preload scope. DENY framing, nosniff, strict-origin-when-cross-origin referrers and restrictive Permissions-Policy cover public/admin/API responses. Production scripts require nonces and exclude unsafe evaluation; stylesheet tags are self/nonce restricted, with an explicit generated-style-attribute exception for Next/Image. API/static responses receive a restrictive non-document policy. The framework identification header is removed.

The installed Next.js CSP guide explicitly rules out nonce-based CSP with Partial Prerendering. Disabled Cache Components/Partial Prefetching and made the root layout request-time rendered, preserving fresh nonce consistency. This deliberately trades static HTML caching for the selected strict script policy. No CSP/script failures or prior uncached-data diagnostic appeared on the production routes checked.

Created the branded [404](../src/app/not-found.tsx) and generic [global error boundary](../src/app/global-error.tsx), preserving Tailwind styling and hiding exception details. Updated stale home-page certificate copy. Expanded [.env.example](../.env.example), replaced the scaffold README with the [client setup/deployment runbook](../README.md), and added [create-only administrator provisioning](../scripts/create-admin.ts) plus a regression test. This operator command creates a fresh Argon2id-backed account from protected one-time environment inputs; it cannot overwrite an existing user's password or role.

Verification evidence:

- Final `npm run build` passed with all public/admin pages dynamically rendered and robots/sitemap retained as metadata assets.
- `npx tsc --noEmit` passed. `npm run lint` passed with zero errors/warnings; the script now enforces `--max-warnings=0`.
- All 13 integration tests passed: requests (4), authentication (4), certificates (4), provisioning (1). Provisioning rejected a short password, created a synthetic account with an Argon2id hash, refused overwrite, and removed its fixture.
- Local production smoke server used `npm run start` with `PORT=3001`. Confirmed script nonce presence and self-hosted Inter, four loaded gallery images, seeded staff login/logout and protected redirects. Login response cookies were HttpOnly/Secure/SameSite=Lax; collected production CSP violations were empty on the checked pages.
- The custom missing-route page appeared at `/does-not-exist` on development and production. Production returned HTTP 404, rendered the branded recovery links, and had no horizontal overflow at the existing mobile viewport.
- `curl -I` confirmed the requested headers on the development home page, production home page and protected redirect. The development-only database probe returned 404 in production with the global headers intact.
- The global error component compiled and passed lint/type checks; deliberate root-layout fault injection was not performed. Include that recovery rehearsal in staging acceptance.

Environment finding resolved: direct invocation of this workstation's system Node 22.13.0 silently exited while importing native Argon2, even outside the sandbox. The project npm runtime (Node 22.16.0) loaded Argon2 and passed production login. Restarted through the documented npm command and verified recovery; no password algorithm or security control was weakened. The README requires one compatible, currently patched runtime and native dependencies installed for the deployment OS. This was an environment/native-runtime issue, not an established Next.js defect.

### Header evidence

Relevant output of `curl -I http://localhost:3000` (PowerShell used `curl.exe`; omitted font preload/Vary/date/connection headers):

```http
HTTP/1.1 200 OK
content-security-policy: default-src 'self'; script-src 'self' 'nonce-yQl6eQdmvJ/rTFsFjN1u7w==' 'strict-dynamic' 'unsafe-eval'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'
strict-transport-security: max-age=31536000
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store
Content-Type: text/html; charset=utf-8
```

Production comparison, `curl -I http://localhost:3001`:

```http
HTTP/1.1 200 OK
content-security-policy: default-src 'self'; script-src 'self' 'nonce-r/sFHUDWqZRjVhTRjJt5SQ==' 'strict-dynamic'; script-src-attr 'none'; style-src 'self' 'nonce-r/sFHUDWqZRjVhTRjJt5SQ=='; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'
strict-transport-security: max-age=31536000
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
cache-control: private, no-store, max-age=0
```

Nonces change on every request. Development debugging allowances above are intentionally absent from production scripts. HSTS/TLS and insecure-request upgrades must be verified again on the actual HTTPS origin.

### Handover Checklist

- [x] Requested MVP feature increments implemented: public shell/content listings, enquiry persistence, staff authentication/dashboard, certificate verification/issuance/revocation and content add/delete.
- [x] Phase 6 headers, branded fallback pages, environment template and production-compatible rendering delivered.
- [x] Production build, strict typing, warning-free lint and all 13 integration tests passed.
- [x] Local production login/cookies/CSP and custom 404 verified.
- [x] Client installation, environment, migration, provisioning and deployment instructions supplied in the README.
- [x] Security implementation evidence and unverified release responsibilities recorded without claiming complete security certification.
- [ ] Client: approve final company/contact/privacy copy and replace mock content, images and certificate fixtures. Existing About/Contact/Privacy shells and marketing notices still contain deliberately unapproved placeholder copy.
- [ ] Operator: choose hosting/domain, set actual HTTPS SITE_URL and secrets, provision a fresh production admin, and keep the default development account/data out of production.
- [ ] Operator: configure trusted X-Real-IP handling/direct-origin isolation for independent per-IP quotas; otherwise the safe shared limit remains active.
- [ ] Operator: validate current dependencies/native runtime, restricted MySQL networking/credentials, supervised startup, HTTP-to-HTTPS redirect, backup/restore and rollback/forward-repair procedures.
- [ ] Client/operator: agree retention, recovery, monitoring and incident ownership; rehearse error recovery and full workflows on staging; approve launch separately.

Stop here. No deployment was performed, no production data was modified, and existing unrelated working-tree changes were preserved.

## Phase 6.5: Final polish, image uploads and animations — 2026-11-26

Owner explicitly authorized this increment after Phase 6. Applied the global frontend-design-dna and frontend-experience skills while preserving the existing Inter/navy/slate/gold identity and Tailwind utilities.

Delivered:

- Nullable imageUrl fields for Service, Programme and BlogPost; applied the additive add_content_images migration and generated Prisma Client. All six migrations were current. The newly generated, unshared migration initially used lowercase table identifiers on Windows; normalized only this increment's SQL to the existing schema's CamelCase identifiers for case-sensitive hosts and reconciled its exact local checksum after verifying the prior value. No earlier migration, schema data or customer record was reset. Linux MySQL replay remains a staging responsibility.
- Authenticated ADMIN/EDITOR multipart upload handler, safe generated filenames, strict Zod validation, streaming/body bounds, shared account quotas and Sharp image decoding/re-encoding. Dedicated validated reads serve new uploads after production builds. Admin forms provide file selection, upload feedback and previews; server actions store validated existing image paths. Catalogues and Gallery render published uploads with mock SVG fallbacks.
- Branded SVG application icon, authored Open Graph PNG and updated root/home metadata. The default scaffold favicon was removed. Brand asset regeneration is available through npm run assets:brand.
- Scroll-triggered compact glass navigation, four staggered feature cards and a testimonial carousel with manual/pause controls, keyboard/hover/background pauses and reduced-motion support. Statements are explicitly illustrative pending client approval; no endorsements or unsupported company capabilities are asserted.
- Sonner notifications for staff management, public enquiries and login; inline field errors/focus handling remain. Production CSP permits only Sonner's exact injected CSS and its initial empty style tag through hashes, retaining strict nonce-based script restrictions. The build fails if the installed stylesheet cannot be identified.
- A scoped Effect 3.22.1 dependency override resolves the audited Prisma configuration dependency advisory while retaining Prisma 7. Installation reported zero known vulnerabilities.

Verification evidence:

- Final npm run build, npx tsc --noEmit and warning-free npm run lint passed. All 16 integration tests passed during this increment (requests 4, authentication 4, certificates 4, provisioning 1, uploads 3); the final upload test rerun also passed after origin-validation extraction.
- Production preview ran through npm run start on port 3001 using the compatible npm Node runtime. A real PNG selected through the admin service form uploaded, previewed, persisted and loaded on both Services and Gallery. Anonymous uploads, disguised PNG, SVG, excess size and extra fields were rejected. Unit tests cover missing/foreign Origin rejection; browser request interception could not reliably override Origin, so this is not claimed as a cross-origin browser test.
- A public enquiry produced the success toast and a matching MySQL record; invalid email showed inline feedback and the error toast. Incorrect login produced the generic credentials toast; correct login reached the dashboard with the signed-in success toast. Temporary synthetic service, enquiry and its unreferenced uploaded image were verified and removed, preserving previous phase submissions.
- At 375px and 1440px, the home page had no horizontal overflow. Mobile navigation opened and closed with Escape. Scrolled navigation reported its compact state and blur(24px). Four feature cards and manual carousel navigation were checked. Reduced-motion reload hid the autoplay control without the earlier conditional-render hydration mismatch. The shared browser reports document.hidden=true even after bringToFront, so automatic visible-tab rotation still requires client visual verification; background pause behaved as designed.
- Production favicon returned 200, title was Smart360 Security Consultancy, Open Graph image metadata was present, and collected CSP violations were empty on the checked final home page. The local fallback OG origin is expected until SITE_URL is set for deployment.
- Final diff whitespace check passed. Existing unrelated working-tree changes were preserved. No qualifying Next.js defect was established for agent feedback; test-selector timeouts and the corrected component hydration mistake were application/test issues.

### Phase 6.5 handover checklist

- [x] Requested database/media, branding, animation and toast implementation complete; setup/security/schema documentation updated.
- [x] Local migration/client generation, production build, strict typing, lint and integration checks completed.
- [x] Real upload-to-publication and form/login feedback verified; synthetic fixtures cleaned up.
- [ ] Client: visually review home scroll reveals, visible-tab eight-second carousel playback, reduced motion, favicon and notifications on actual mobile/desktop browsers.
- [ ] Client: replace illustrative testimonials and remaining placeholder copy with approved material and publish only licensed public imagery.
- [ ] Operator: provide durable shared writable public/uploads storage, backup/restore it with MySQL, monitor disk capacity, set real SITE_URL and recheck CSP/cookies/uploads on staging HTTPS.

Stop after this increment. No deployment was performed.

## Phase 7: Company page CMS, counts, sidebar and documentation — 2026-11-26

Owner authorized this final feature increment before future Cloudinary/deployment work. Read the global code-documentation skill and used implementation-grounded documentation rather than marking the original aspirational checklist complete wholesale.

Delivered:

- Regenerated Prisma Client 7.10.1 before and after the additive add_pages migration. Page has a cuid id, unique bounded slug, title and Text content. All seven migrations report current. The local seed successfully created About, Contact and Privacy drafts with empty-update upserts so reruns preserve staff edits and existing credentials. Actual phone/email/address and privacy commitments were not supplied; professional draft copy clearly identifies those remaining placeholders instead of inventing facts.
- Added /admin/pages for ADMIN/EDITOR with individual plain-text editors, strict supported-slug/title/content validation, safe errors, toast feedback and explicit Prisma writes. Each action independently resolves staff permissions and calls revalidatePath for its public route and /admin/pages. Public pages fetch title/content by slug, render escaped paragraphs and distinguish missing records from unavailable storage.
- Replaced placeholder list-limit text with actual displayed record counts, including deduplicated Gallery items. Zero results use “No records found.” Existing 24-record bounds and publication filtering remain.
- Replaced duplicate sidebar identity/role copy with branding only. Added scrollable flex navigation, gold active indication and bottom-pinned logout in the dark full-height sidebar; Pages is included for content staff.
- Replaced stale phase planning with actual completed scope, generated an exact final-schema inventory and rewrote the security checklist to check implemented controls while assigning still-unverified release gates. Updated agent guidance and README for the current authorization, CMS operation and production data initialization. No Cloudinary or deployment work began.

Verification:

- npx prisma generate succeeded twice; migrate status showed seven migrations up to date; npx prisma db seed completed without replacing existing content.
- npm run build, npx tsc --noEmit and npm run lint passed. No Prisma missing-model diagnostics were returned by the editor check; its remaining reports were two pre-existing Tailwind canonical-class suggestions. Restarted only the verified project dev server to refresh the singleton after client regeneration. If a separate editor window retains stale types, use TypeScript: Restart TS Server.
- npm run test:cms passed both tests: bounded strict inputs/duplicate FormData rejection and real database unique-slug/update/seed-preservation behavior. Synthetic page fixture was removed. The prior sixteen integration-test results remain recorded in Phase 6.5; they were not all rerun merely for this phase.
- Production browser /admin/pages listed all three page editors. Edited About, saved successfully, then navigated immediately to the public About page and saw the new text. A script-shaped string appeared literally with no injected script element. Restored the original through the same editor and confirmed the temporary text was absent publicly.
- Public browser counts exactly matched rendered items: Blog 2, Services 3, Programmes 3, Gallery 4. The unpublished blog draft remained excluded.
- Sidebar geometry at a 900px viewport showed 900px height, navigation overflow-y:auto, Pages marked current, no duplicate administrator identity and logout bottom at 900px. At a 360px-high viewport, navigation overflowed internally while logout remained at the viewport bottom. The shared browser resets its viewport while hidden, so stable desktop screenshot capture was limited; final aesthetic acceptance belongs to the owner.
- Logout followed by a direct /admin/pages request redirected to /admin/login with no editor forms exposed. Production authentication continued working with the unchanged session controls.
- Final whitespace/diff and targeted diagnostics checks recorded. No qualifying new Next.js defect was established; hidden browser resizing and ordinary navigation aborts were not treated as framework defects.

Handover: review /admin/pages and the three public pages on the development server at port 3000. Supply approved contact details and privacy text before launch. Production requires approved Page rows through a controlled data step because the mock seed remains prohibited there. Release/hosting/security gates are documented in [SECURITY.md](./SECURITY.md); no unverified infrastructure control is represented as checked. Stop here pending further owner instructions.

## Phase 7.5: Full-width administration and table filters — 2026-11-26

Owner accepted Phase 7 and authorized layout/filter changes only. Removed management/page form width caps and the shared table cell cap, made main/table/form containers explicitly full width, and added rounded borders, spacing, alternating row backgrounds and hover feedback. Horizontal overflow remains inside focusable table regions. Login's intentionally narrow sign-in card is unchanged.

Added server-rendered GET filter bars with awaited Next.js searchParams and strict Zod query schemas. Certificate search matches recipient name or number; statuses include effective UTC expiry, retaining revocation precedence and validity through the printed day. Requests match name/email with NEW, IN_PROGRESS, CLOSED and All/Training/Quote selections. Unselected types are neither queried nor rendered. Unknown/repeated fields, invalid statuses/types and overlong searches show safe filter feedback without running listing queries. ADMIN checks still run before query handling. Limits remain 50 certificates or 50 requests per selected type; no pagination or status-edit workflow was added.

Verification evidence:

- npm run test:admin-filters passed all three tests: strict/malformed query rejection, real MySQL combined certificate search/status with inclusive UTC expiry and revoked precedence, and enquiry name/email/status filtering. Synthetic certificates, requests and programme were cleaned up; existing records were not modified.
- Production browser form submission searched a seeded certificate recipient with VALID and returned exactly one matching row. Switching to REVOKED while retaining that search returned the empty state; clearing the search returned three revoked rows. Training/NEW/name search returned one row with the Quote section absent. Quote/email search returned one row with Training absent; Reset restored both tables and the clean URL.
- Browser measurements at 1600px showed all six sections' form/table wrappers matching available main-column width (1249px or 1264px depending on scrollbar), with no document-level horizontal overflow. Existing sidebar styling and active navigation remain. Stable screenshots remain limited by the shared browser's hidden viewport resets; owner visual review is the final aesthetic check.
- Final npm run build and npx tsc --noEmit passed. npm run lint passed with no warnings during this increment; targeted editor diagnostics and whitespace/diff checks were clean. The final build includes the display-count grammar polish. No schema change, migration, Cloudinary integration or deployment was required.

Stop after this increment. Test Requests and Certificates with Apply filters and Reset before approving the next phase.

## Phase 8: Cloudinary cloud storage — 2026-11-26

Owner authorized replacing local uploads with Cloudinary and supplied server environment credentials. Read the relevant installed Next/Image guidance, global security/code-documentation skills and official Cloudinary upload/folder documentation. Preserved the existing transport, image processing, staff permissions and response contract.

Implemented Cloudinary SDK 2.11.0 with lazy server-only configuration, protected environment placeholders and no credentials in output or client code. The configuration loader trims pasted whitespace and normalizes cloud-name case without editing the environment file. Initial live configuration validation failed on copied whitespace; after normalization an authenticated Cloudinary ping succeeded. No authorization or image-validation control was weakened.

The Node multipart handler retains matching Origin, current ADMIN/EDITOR access, shared quotas, strict Zod fields, bounded bodies and the 5MB file limit. Sharp still verifies/decode/re-encodes JPEG/PNG/WebP with pixel/dimension limits and metadata removal. The sanitized buffer now goes through signed upload_stream with smart360_uploads, a random generated ID, overwrite:false and a 45-second timeout; route duration budget is 60 seconds. The existing { url } response now carries secure_url. Content saves verify the configured account and resource URL through Cloudinary before storing the HTTPS value. Arbitrary remote URLs, foreign clouds, query strings, active SVG and local upload paths remain rejected.

Added HTTPS remotePatterns restricted to the configured cloud path and added the Cloudinary delivery host only to CSP img-src. All public renderers/admin preview already use the shared image source validation and Next/Image, so they now accept the new validated URL format. Script/connect restrictions remain intact. Removed local writes, the post-build local-image serving route and the empty public/uploads directory; no schema change/migration was needed. All active content/gallery database fields had zero old local upload references.

Verification:

- npm install cloudinary completed after the sandbox registry restriction was retried with authorized network access; installation reported zero known vulnerabilities.
- Final npm run build and npx tsc --noEmit passed. Lint passed during the increment, targeted editor diagnostics were clean, and final diff whitespace checks passed.
- All three updated upload tests passed, including actual format/size processing, mocked sanitized streaming, URL/account validation, provider failure and case/whitespace normalization. Automated tests use mocks for provider writes; the real integration was verified separately below.
- Logged in through the production UI, selected the actual branded PNG in the service form, waited for its Cloudinary preview to load, and published successfully. The corresponding MySQL record stored the Cloudinary HTTPS URL.
- Cloudinary's authenticated resource API confirmed the actual asset, matching secure URL and smart360_uploads folder metadata. The Cloudinary dashboard UI itself was not inspected; API metadata supplied provider-side confirmation.
- Temporary programme/blog fixtures reused that same uploaded URL to check every requested renderer. Services, Programmes, Blog and Gallery each loaded one Cloudinary image with positive natural dimensions and no collected CSP violations. Existing SVG fallbacks remained.
- Removed the three synthetic publication records and then the test asset only after confirming no remaining database references. Removed one-time diagnostic/verification scripts. Existing customer-like fixtures were preserved.
- Restarted only the verified Smart360 development process with network access for subsequent uploads on port 3000. No production deployment or actual environment-file edit occurred. No qualifying new Next.js defect was established; ordinary cold navigation timeouts and the corrected configuration whitespace issue were not treated as framework defects.

Handover: upload a JPEG/PNG/WebP through /admin/services, /admin/programmes or /admin/blog, wait for the preview and publish; inspect the matching public page/Gallery and Cloudinary's smart360_uploads folder. Configure all three secrets on the eventual host. Cloudinary removes the writable-disk requirement but does not override hosting request limits: the current Vercel default is below the application's 5MB limit unless its larger-request configuration is enabled and eligible. Confirm actual payload/duration settings in staging; no hosting plan, paid setting or deployment was changed. See the [Cloudinary runbook and references](../README.md#cloudinary-upload-operation-phase-8).

Stop here pending owner verification.
