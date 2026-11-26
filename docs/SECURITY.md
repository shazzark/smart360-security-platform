# Security implementation and release checklist

Status: application controls delivered through Phase 8 are recorded below against the actual implementation. Checked boxes describe implemented controls and the evidence cited; they are not security certification. Unverified deployment responsibilities are explicitly separated at the end. See [SESSION.md](./SESSION.md) for dated checks and [README.md](../README.md) for operating instructions.

## Trust boundaries and scope

Public browsers are untrusted. Staff sessions authorize administrative actions, and server-side checks apply independently of proxy redirects or hidden navigation. Private assets include staff credentials, sessions, enquiry details, unpublished content, certificate integrity and database/media credentials. Uploaded media and valid certificate lookup fields are intentionally public. Deployment, MFA, public registration/reset and a staff-management UI are not part of this implementation.

## Passwords and account lifecycle

- [x] Argon2id through the maintained argon2 package uses 19 MiB memory, two iterations, parallelism one, random salts and complete encoded hashes. Verification rejects malformed hashes safely.
- [x] Login uses generic credential errors and a dummy hash for unknown accounts. Zod bounds input lengths; the controlled provisioning command requires a 16–1024-character password. The local default fixture is development-only and is never an approved production account.
- [x] Shared database login throttles enforce 10 attempts/account/15 minutes and a global 30 attempts/minute; quota failures deny attempts. This is account/global protection, not a claim of trusted per-IP login limits.
- [x] Production administrator provisioning creates only, hashes with Argon2id and refuses to overwrite or elevate an existing account. Mock seeding refuses production and non-local database hosts and never replaces existing staff passwords.
- [x] Current account activity, password fingerprint and role are checked when resolving sessions. Disablement or password/role changes invalidate session use. Maintained jose signs/verifies identifiers; no custom cryptographic algorithm is used.

Host-specific Argon2 benchmarking, compromised-password screening, staff recovery and MFA remain release decisions below. Do not claim they exist based on a hashing test.

## Sessions, cookies and RBAC

- [x] A random 256-bit session identifier is signed with HS256 using jose, issuer/audience/algorithm/expiry checks and a secret of at least 64 characters. Only its SHA-256 digest is stored with the database session; cookies contain no password or enquiry data.
- [x] __Host-smart360_session is HttpOnly, Secure, SameSite=Lax, Path=/ with no Domain. Local browser tests use localhost's secure-cookie exception; production requires HTTPS. Login rotates identity; logout revokes the database session and expires the cookie.
- [x] Server-enforced idle expiry is 30 minutes and absolute expiry eight hours. Session lookup fails closed on invalid, stale, inactive, changed-role/password or unavailable records; safe staff fields alone reach consumers.
- [x] Proxy signature checks redirect anonymous admin requests; protected layouts, pages and each action independently resolve the current database session/role. All roles are server-derived; mass assignment is prevented by strict schemas and explicit writes.
- [x] ADMIN alone views enquiries/private dashboard counts and manages certificates. ADMIN and EDITOR manage content, uploads and company pages. Public users can read published content/company pages, submit limited enquiries and verify an exact certificate code.
- [x] Private/nonce-bearing HTML uses private no-store responses. Admin indexing is blocked through metadata/headers and robots rules; indexing controls are not authorization. Redirect targets are fixed internal routes.
- [x] Authentication regression coverage includes wrong credentials, tampered/expired/revoked sessions, account disablement, role/password changes and shared throttling. Browser history records anonymous redirects and HttpOnly/Secure/SameSite=Lax login-cookie checks.

Gallery editing, handling-status changes, staff changes and certificate correction do not have administrative UI and are not implied by the permissions above.

## Validation, API inputs and write safety

- [x] Every application input boundary uses Zod: enquiry/login/admin/page forms, certificate JSON lookup, upload multipart fields/Origin/content type, image read path/query and the development probe's query. Strict objects reject extra writable fields and duplicate FormData values; framework action metadata is excluded deliberately.
- [x] Enquiries validate email/phone/lengths, look up published catalogue choices, persist explicit fields, suppress identical requests within 60 seconds and limit each request type to five/email/15 minutes in serializable transactions. Honeypots add basic spam filtering. Rotating-address bots still require deployment edge controls.
- [x] Next.js Server Actions retain same-origin CSRF checks and a 64KB request limit; no broad allowedOrigins/CORS exception exists. Uploads separately require an authenticated matching Origin. SameSite cookies are not the sole CSRF control.
- [x] Certificate POST bodies are streamed/bounded to 2KB, with content-type, exact-code and query validation. Unsupported methods receive framework rejection; normal public reads do not mutate business records.
- [x] Prisma uses parameterized model operations, explicit writes and minimal public field projections. Foreign-key restrictions prevent deleting services/programmes attached to enquiries. Generic errors hide SQL, secrets and stack traces.
- [x] The database-writing GET /api/health is deliberately development-only and returns 404 in production; never configure it as a production probe.
- [x] Page saves require current ADMIN/EDITOR access, allow only about/contact/privacy, title 2–191 and content 20–10,000 characters. Only title/content update, with route revalidation after success. Text is React-escaped; raw HTML, scripts and arbitrary URL fetching are not interpreted. Draft seed contact/legal details remain explicitly unconfirmed.

## Certificate verification and abuse prevention

Phase 7.5 private filters validate bounded single-value search/status/type parameters with strict Zod objects, use explicit Prisma where clauses, and enforce ADMIN before reads. Invalid query shapes do not run listing queries. Results remain bounded to 50 per selected type; certificate status queries retain inclusive UTC expiry and revocation precedence. Search terms live in private admin URLs: configure logging/analytics to avoid collecting complete query strings.

- [x] Public lookup accepts only a normalized complete S360- code with 32 hexadecimal characters. Codes contain 128 random bits and have a database unique constraint. There is no public listing, wildcard, prefix or recipient-name lookup.
- [x] Database-backed VerificationThrottle enforces five attempts/client/fixed UTC minute plus a global 100/minute, using shared serializable transactions and bounded conflict retries. Stale buckets are removed; quota exhaustion returns 429 and Retry-After, unavailable storage returns generic 503.
- [x] By default unidentified callers share a conservative bucket. VERIFY_TRUST_PROXY permits X-Real-IP only when explicitly enabled; spoofable forwarded headers do not automatically create fresh identities. Canonical IP handling is implemented; trusted proxy configuration must be verified at deployment.
- [x] Unknown, revoked, explicit/date-expired and future-issued certificates share the generic invalid response. Revocation takes precedence. Current valid certificates disclose only recipient name, programme snapshot and issue date; expiry is inclusive of the printed UTC date.
- [x] Verification responses use no-store and codes stay out of URLs. Logs omit complete codes and enquiry bodies. Issuance/revocation checks ADMIN in each server entry point; public lookup cannot mutate records.
- [x] Certificate tests and earlier browser checks cover valid/invalid/date boundaries, six rapid calls, generated issuance and revocation. These local checks do not replace actual reverse-proxy or distributed-load acceptance.

## Media and browser content safety

- [x] ADMIN/EDITOR upload permission, matching Origin, strict multipart fields, maximum one JPEG/PNG/WebP file, 5MB file limit and bounded streamed envelope. Shared per-account upload quota is 20 attempts/ten minutes and fails closed.
- [x] Sharp decodes the actual format, rejects MIME mismatch/animated or multipage content, bounds decoding to 25 million pixels, auto-orients, resizes within 2400px and re-encodes without EXIF/GPS/appended payloads. Output size is bounded too; executable SVG uploads are rejected.
- [x] Generated random asset IDs, validated Cloudinary URLs prevent caller-selected disk paths. Signed uploads stream only sanitized bytes into smart360_uploads with overwrite disabled. Content saves verify asset existence through the configured account SDK; no arbitrary caller-selected URL is fetched. Local image writes and the old serving route are removed.
- [x] Upload URLs are public immediately, even before a record is published. Public Gallery lists only published content images and deduplicates URLs. Deleting content retains image files intentionally; reference-aware orphan cleanup is an operator task.
- [x] Three current upload tests cover real JPEG/PNG/WebP processing, metadata stripping, size/Origin/path checks, sanitized Cloudinary streaming, account validation and provider failure. Earlier Phase 6.5 browser checks verified rejection of anonymous, SVG, disguised, oversized and extra-field uploads; Phase 8 separately verified live cloud upload/preview/publication. Cross-origin header override could not be exercised reliably through the browser tool; Origin denial is covered at the helper boundary.
- [x] UI uses escaped text and approved local images. Sonner notifications retain field errors and keyboard focus. Motion respects reduced-motion settings and the carousel has pause/manual controls. Illustrative testimonials are labeled and require replacement/approval before launch.

## CSP and HTTP headers

- [x] Production HTML has a per-request random 128-bit nonce CSP: self/nonce/strict-dynamic scripts, no unsafe-eval or script attributes; self-hosted fonts; self images/connections plus approved Cloudinary HTTPS images and necessary image data URLs; object/frame none, self base/form and no frame ancestors.
- [x] Sonner's exact fixed injected CSS and its initial empty style element use hashes computed/allowed explicitly. The build fails if its stylesheet cannot be identified. Style attributes needed by Next/Image and motion are the explicit unsafe-inline exception; arbitrary script/style tags are not broadly allowed.
- [x] Installed Next.js guidance was followed: dynamic root rendering, Cache Components/Partial Prerendering disabled, no shared nonce HTML caching. Development-only evaluation/HMR allowances are absent in production. Production upgrade-insecure-requests activates only for an HTTPS SITE_URL.
- [x] Global HSTS max-age=31536000, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin and restrictive Permissions-Policy cover routes/errors/redirects/static/API responses. Framework identification is disabled. HSTS deliberately omits unapproved subdomain/preload policy.
- [x] Production browser checks recorded working hydration, login, images, toasts, icon and no collected CSP violations on checked pages. Custom 404/global-error UI hides stack traces; deliberate root-layout crash recovery remains a staging check.

## Secrets, dependencies and operational evidence

- [x] Environment examples contain placeholders for DATABASE_URL, SESSION_SECRET, SITE_URL and proxy/provisioning options; secrets are ignored and database modules are server-only.
- [x] Operational events include actor/action/internal targets without raw passwords, cookies, tokens, certificate codes or enquiry bodies. Hosting must provide the protected log sink, retention and monitoring.
- [x] Scoped Effect 3.22.1 override addresses the audited Prisma configuration dependency advisory while retaining Prisma 7. The Phase 6.5 installation audit reported zero known vulnerabilities; future advisories require ongoing review.
- [x] Compatible native Node runtime, build/start and provisioning procedures are documented. Synthetic local tests guard against production/non-local targets and clean their fixtures; earlier verified customer-like Phase 3 fixtures are preserved.
- [x] Migration review and local status/generation checks preserve existing data; no reset or production migration is authorized by this checklist. Deployment, backup/recovery and known limitations are documented rather than certified.

## Open release gates — client/operator ownership

These are fully documented outstanding responsibilities, not completed application tasks. Do not check them off without evidence.

- [ ] Operator, high: configure real HTTPS SITE_URL/secrets, HTTP redirect, trusted proxy overwriting X-Real-IP and direct-origin isolation; verify independent quotas/cookies/CSP on staging HTTPS.
- [ ] Operator, high: restrict MySQL networking and account privileges, separate migration credentials, verify encryption across hosts, and keep WAMP/phpMyAdmin inaccessible publicly.
- [ ] Operator, high: configure protected Cloudinary credentials/access, usage monitoring and tested coordinated database/media recovery; define recovery objectives and rollback/forward-repair ownership. Cloudinary is integrated in Phase 8; staging hosting and payload limits still require verification.
- [ ] Client, high: approve company identity/contact facts, public certificate disclosure, image rights, legal bases, processors/transfers, retention/deletion and privacy request/complaint channels. Seed privacy text is a draft, not legal approval.
- [ ] Operator, medium: define staff recovery/identity verification, account revocation process, Argon2 host benchmarking, compromised-password screening policy and accepted password-only risk/MFA decision.
- [ ] Operator, medium: configure edge abuse protection for public forms, protected aggregate monitoring/logging and an incident process for credential leaks, unauthorized changes, spam and outages. No paid infrastructure is silently assumed.
- [ ] Client/operator, medium: remove development credentials/mock fixtures, approve final content/testimonials, rehearse all workflows, actual database migration replay and root-layout error recovery on isolated staging; authorize release separately.
- [ ] Operator, medium: rerun current dependency/secret checks, install native modules for the target OS/runtime, validate service supervision and assign update/incident/backup owners.

## Phase 8 Cloudinary controls

- [x] Server-only SDK configuration validates and trims all three credential values; cloud names are case-normalized. No secrets use NEXT_PUBLIC_ or appear in client responses.
- [x] Existing RBAC, matching Origin, shared quotas, 5MB limit, streamed request bounds and Sharp decoding/re-encoding remain before signed upload_stream. Uploads use generated IDs, overwrite:false and a bounded provider timeout.
- [x] URL validation allows versioned HTTPS res.cloudinary.com image/upload paths in smart360_uploads. Content saves enforce the configured account and verified resource URL; foreign clouds, remote fetch URLs, query strings and local paths are rejected.
- [x] Next/Image remotePatterns restricts the configured cloud path and CSP img-src adds the Cloudinary host without widening script/connect permissions. Existing SVG placeholders remain local.
- [x] Local file writes/serving and the empty upload directory were removed. Cloud assets are public immediately and retained when content is deleted to protect shared references.
- [x] Upload tests cover sanitized streaming, provider failure, ownership/path/host checks and normalized configuration; live browser/provider outcomes are recorded in SESSION.md.
- [ ] Operator: confirm Cloudinary account access, privacy/vendor decisions, retention/export/restore, usage quotas and hosting request-size/duration settings on staging. Application 5MB validation does not override a host's smaller payload cap.
