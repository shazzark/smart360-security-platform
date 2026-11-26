# Smart360 Security Consultancy

Corporate website with database-backed service/programme/blog/gallery listings, training and quote forms, protected staff administration, and exact-number certificate verification. Built with Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, Prisma ORM 7, Zod, and MySQL. HTTP APIs use Route Handlers; approved form and staff mutations use Server Actions. There is no custom server.

The requested MVP implementation is complete. Deployment is a separate step: company copy, contact details, privacy wording, and mock content still need client approval. See [handover status](docs/SESSION.md) and [security controls and release gates](docs/SECURITY.md). No production deployment has been performed.

## Requirements

- A supported Node.js version compatible with Prisma 7 (`^20.19`, `^22.12`, or `>=24`), using a currently supported release and current security patch. Local verification used Node 22.16.0; this is test evidence, not a recommendation to retain an old patch. Match the runtime across build and hosting.
- npm and the checked-in lockfile. Install dependencies for the target operating system so native Argon2/Prisma modules are compatible.
- MySQL with InnoDB and `utf8mb4`; local development uses WAMP. Use separate development and production databases and credentials. Development migration privileges include a shadow database; production runtime credentials should not have schema-management privileges.
- Network access during installation and initial builds: `next/font` downloads Inter during build and serves it locally at runtime. Browsers do not need Google Fonts access.

## Install and run locally

1. Start MySQL and create a dedicated empty development database with InnoDB as the default engine.
2. Run `npm ci` from the repository root.
3. Copy [.env.example](.env.example) to an ignored `.env` file and replace the database and session-secret placeholders. Keep `SITE_URL` empty locally to prevent indexing.
4. Apply migrations and generate Prisma Client:

   ```sh
   npx prisma migrate deploy
   npx prisma generate
   ```

5. Optional local mock data: `npx prisma db seed`. This also creates the previously requested development administrator. Its credentials are for local testing only; the seed refuses production and non-local databases. It never overwrites an existing staff password. Never deploy a copy of the development database or its default account.
6. Start `npm run dev` and open `http://localhost:3000`. Staff login is `/admin/login`; public certificate verification is `/verify`. Copy a seeded certificate number from `/admin/certificates` for a local check.

For new schema changes, use `npx prisma migrate dev --name descriptive_change` only against development, review the generated SQL, and regenerate Prisma Client. Do not reset a populated database to resolve migration problems. Existing migrations explicitly preserve InnoDB where local MyISAM defaults previously caused issues.

## Environment configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Required server-only MySQL URL. URL-encode credentials. Use a private reachable production database; WAMP on a developer's laptop is not a production service. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Required server-only Cloudinary product-environment credentials for signed uploads and asset verification. Supply all three through protected host configuration; no NEXT_PUBLIC_ prefix. Rebuild after changing cloud name. |
| `SESSION_SECRET` | Required for staff sessions: unique cryptographically random secret of at least 64 characters. Keep it in the hosting secret store. Rotating it invalidates signed login cookies. |
| `SITE_URL` | Required before public launch: the real HTTPS origin, without credentials/path/query/fragment. Used at build time for canonical URLs, sitemap and robots; rebuild after changing it. Empty means localhost URLs and indexing disabled. |
| `VERIFY_TRUST_PROXY` | Default `false`: unidentified clients share a five-per-minute verification bucket. Set `true` only behind a proxy that overwrites `X-Real-IP` and blocks direct origin access. |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | One-time provisioning inputs for `npm run admin:create`, not application runtime requirements. Remove them immediately afterward. |

Generate a session secret locally with `node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))"`, then transfer it through protected configuration. Never commit it, expose it through `NEXT_PUBLIC_`, or paste secrets into support logs. A unique password of 16–1024 characters is required by the provisioning command.

## Verification commands

```sh
npm run lint
npx tsc --noEmit
npm run build
npm run test:requests
npm run test:auth
npm run test:certificates
npm run test:provisioning
npm run test:uploads
npm run test:cms
npm run test:admin-filters
```

Integration tests deliberately refuse production/non-local database targets. They use temporary synthetic fixtures in the local development database and clean up those fixtures. Do not run them against customer data. On this Windows agent, tsx needs ordinary account access outside its restricted sandbox.

## Deploy to a Node.js host

Static export is not supported: the application requires Server Actions, Route Handlers, Prisma, and request-time rendering. Use a host that supports Next.js's Node runtime, compatible native modules, persistent database access, and an appropriate bounded connection pool.

1. Approve final content, contact/privacy details, certificate disclosure, retention policy, operational owners, and hosting. Remove mock records through the appropriate controlled workflow. Do not run the mock seed in production.
2. Create the private production MySQL database and restricted application user. Back up existing data before upgrades and test restore on an isolated database. Use separate migration credentials through a protected release job.
3. Configure `DATABASE_URL`, `SESSION_SECRET`, and the actual HTTPS `SITE_URL` in the deployment environment. Provide database encryption settings appropriate to the selected provider; never expose MySQL/phpMyAdmin publicly.
4. Install with `npm ci`, then run `npx prisma generate`. In the controlled migration job run `npx prisma migrate deploy`; inspect migration status before switching traffic. Use forward repairs for migration failures, not unapproved resets.
5. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Supply `SITE_URL` during the build, and the required secrets at runtime. Keep development dependencies available for the build/migration/provisioning jobs.
6. Provision the first production administrator through an authorized maintenance job: securely inject the one-time `ADMIN_*` environment variables, run `npm run admin:create`, and remove those variables. The command hashes with Argon2id, creates only, and refuses to reset or elevate an existing user. Do not put a password in command arguments or shell history. Existing-account recovery requires a controlled operator procedure, not another seed run.
7. Start `npm run start` under the host's supervised service with `NODE_ENV=production`. The default port is 3000; a host can provide `PORT`. Serve the app behind HTTPS and redirect HTTP to HTTPS. Do not use `npm run dev` for production.
8. For independent client-IP quotas, configure the trusted proxy as described above, set `VERIFY_TRUST_PROXY=true`, and verify forwarded-header spoofing cannot bypass it. Until then the conservative shared quota remains active. Also configure edge-level request/body/time limits appropriate to the host.
9. Do not cache HTML, private pages, or verification responses at a CDN. Nonce CSP requires fresh HTML; Partial Prerendering and Cache Components are disabled intentionally. Static assets remain cacheable.
10. Smoke-test home/navigation, forms, staff login/logout, certificate issuance/lookup/revocation, the custom 404, database migrations, and the security headers on the real HTTPS origin. Check cookies remain HttpOnly/Secure/SameSite=Lax and no CSP violations appear. Confirm canonical URLs, sitemap and robots match the real domain.
11. Assign monitoring, backup/restore, staff account recovery, incident response, and dependency update ownership. Keep the previous application artifact and a tested database recovery/forward-migration plan; reverting code does not undo database writes.

## Headers and operational notes

Runtime troubleshooting: this workstation's system Node 22.13.0 silently exited when loading `argon2`, while the Node 22.16.0 resolved by project npm commands loaded it and passed production login. Use the same compatible Node installation for installation, tests, build, provisioning, and the supervised `npm run start` service. Check `node -p "process.version + ' ' + process.execPath"` in that service environment and confirm `node -e "require('argon2'); console.log('Argon2 loaded')"` succeeds. Reinstall native dependencies on the target system rather than copying another workstation's `node_modules`.

All routes receive HSTS (`max-age=31536000`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. HSTS takes effect over HTTPS; it deliberately does not opt every subdomain into HTTPS or preload an unapproved domain.

HTML receives a fresh nonce CSP. Production scripts cannot use inline event handlers or `unsafe-eval`; scripts/styles/fonts/images/connect requests are restricted to approved sources. Next/Image's generated style attributes are the documented inline-style exception. Development allows debugging evaluation and hot-reload connections. API/static responses receive a restrictive non-document CSP. When the confirmed production `SITE_URL` uses HTTPS, production HTML adds `upgrade-insecure-requests`.

The development `/api/health` probe writes a database row and deliberately returns 404 in production. Do not use it as a production load-balancer probe. Configure host-level process checks and a non-mutating operational database check in the deployment environment.

Unexpected crashes use a generic global error page with retry/home controls; details and stack traces are not rendered. Review restricted server logs when investigating. The production error boundary has not been verified through deliberate root-layout fault injection; rehearse that on staging before release.

Useful references: [scope](docs/PROJECT_OVERVIEW.md), [phase history](docs/SESSION.md), [database design](docs/DATABASE_SCHEMA.md), [security checklist](docs/SECURITY.md), and [agent rules](docs/AGENTS_CONFIG.md).

## Phase 6.5 media and presentation

Staff with ADMIN or EDITOR access can upload an optional featured image when adding a service, programme or blog post. Select a JPEG, PNG or WebP up to 5MB, wait for its preview, then publish. Public catalogues use the uploaded image or the existing SVG placeholder. Published content images also appear in Gallery; drafts remain excluded.

Uploads require authentication, a matching Origin, strict multipart validation and a shared per-account quota (20 attempts per ten minutes). The server decodes and re-encodes images, strips metadata, rejects animated/disguised files, limits decoded pixels, and generates filenames. Upload URLs are publicly readable immediately: upload only approved public imagery. Removing a record does not delete its file, to avoid breaking shared references. Remove orphan files only after checking all database references and backups.

**Cloud storage:** Phase 8 replaces local media storage with Cloudinary. No writable upload volume is required. All new media is signed and uploaded server-side into smart360_uploads; MySQL stores the secure HTTPS URL. Configure the three CLOUDINARY_* secrets on each environment, restrict account access, monitor Cloudinary usage, and coordinate media retention/export with database backups. Deleting content retains its asset to avoid breaking shared references.

The home page includes staggered feature reveals and a testimonial carousel with manual navigation and pause controls. Automatic rotation pauses on hover, keyboard focus and hidden tabs, and is disabled for reduced motion. Testimonial text is explicitly illustrative; obtain approved client endorsements before launch.

Sonner supplies accessible notifications while field-level validation remains inline. Its fixed injected stylesheet is permitted by an exact build-derived CSP hash plus the empty-style hash required by its insertion sequence; production script nonces remain enforced. Review this integration when upgrading Sonner. Style attributes used by Next/Image and motion remain the documented exception.

The branded SVG app icon and Open Graph PNG replace the scaffold icon. Regenerate the PNG with `npm run assets:brand` after changing its authored artwork. Rebuild with the actual `SITE_URL` for correct social URLs. A scoped Effect 3.22.1 override under `@prisma/config` addresses [GHSA-7589-6fvf-x4pw](https://github.com/advisories/GHSA-7589-6fvf-x4pw) without changing Prisma's major version; review it with future dependency updates.

## Company page CMS

Sign in and open `/admin/pages` to edit About, Contact and Privacy. ADMIN and EDITOR can change title/content; Save page publishes immediately and revalidates the matching public route. Text is plain, escaped content: blank lines separate paragraphs, HTML is displayed literally, and content is limited to 10,000 characters. The fixed slugs cannot be renamed or used to create arbitrary routes.

Local seeding adds three professional draft pages without overwriting staff edits on rerun. Contact numbers, addresses, email and legal commitments remain unconfirmed until the owner supplies them. The production mock-seed prohibition still applies: include approved Page records as a controlled release data step before enabling public traffic. Missing records yield 404; a database outage shows a safe unavailable state. After changing the Prisma schema, regenerate the client and restart the dev server to refresh its singleton; if only VS Code retains old type errors, run **TypeScript: Restart TS Server**.

Public Blog, Services, Programmes and Gallery display the number of records actually rendered, up to the existing 24-item bound. Gallery counts its deduplicated images; unpublished blog drafts are excluded. Empty lists say “No records found.” These counts are not the total number of stored records when the display limit is reached.

## Admin table filters

Requests and Certificates have GET filter forms. Enter a search, choose the applicable status/type, and select **Apply filters**. **Reset** clears the URL filters; browser Back and bookmarks preserve prior selections. Request statuses are NEW, IN_PROGRESS and CLOSED, with All/Training/Quote type choices. Certificate status filters include date-based expiry: VALID records past their printed UTC expiry date appear under EXPIRED, while revoked records remain REVOKED. Search matches recipient/number for certificates and name/email for requests.

Each certificate list displays at most 50 matching records; requests display at most 50 of each selected type. These are bounded lists, not pagination or all-record totals. Repeated/unknown filter fields, invalid enums and searches over 191 characters show a validation message without running the listing query. Admin-only access remains enforced. Search terms are included in private admin URLs; avoid collecting full admin query strings in analytics/access logs. Shared table containers and content/page forms use the available main-column width, with horizontal table scrolling on narrow screens.

## Cloudinary upload operation (Phase 8)

The Node.js upload Route Handler accepts multipart images up to 5MB, authenticates staff, validates Origin and quota, and decodes/re-encodes before calling the signed Cloudinary SDK upload_stream method. No file is written to application disk. The folder parameter places assets in smart360_uploads in fixed and dynamic folder modes; generated random IDs and overwrite:false avoid collisions/overwrites. The response remains { url }, containing secure_url, so existing preview/publication forms keep their contract.

Image URL validation permits versioned image/upload URLs with generated IDs in the expected folder. Content saves verify the configured cloud and retrieve that asset through the SDK before persisting its URL; arbitrary URLs and foreign accounts are rejected. Next/Image remotePatterns restricts HTTPS delivery to the configured cloud path, and CSP img-src permits res.cloudinary.com. The API secret/key remain server-side. Existing SVG placeholders remain local and work without an upload.

The old local upload directory and serving handler were removed. Do not restore /uploads paths: old local references, if imported from another database, must be migrated to approved cloud assets before release. The local folder was empty apart from its placeholder during this change. Assets uploaded are public immediately; upload only imagery approved for publication. Remove orphan Cloudinary assets only after checking all database references.

Hosting still has request limits independent of Cloudinary storage. The application accepts 5MB, but Vercel's default function payload cap is 4.5MB including multipart overhead. Its current larger-request public beta requires explicit project configuration and Performance memory; confirm eligibility and test a near-limit image in Preview before enabling production. No Vercel project setting or paid memory configuration was changed here. See [Vercel's current payload guidance](https://vercel.com/docs/errors/function_payload_too_large) and [larger-body opt-in](https://vercel.com/changelog/vercel-functions-now-support-request-bodies-up-to-20mib). The route uses Node.js and a 60-second duration budget with a 45-second provider upload timeout; hosting must support that budget.

References: [Cloudinary Node upload streams](https://cloudinary.com/documentation/node_image_and_video_upload), [folder mode compatibility](https://cloudinary.com/documentation/folder_modes).