# Smart360 Security Consultancy — Project Overview

Status: Draft for owner review. This is a proposed delivery baseline, not a transcription of the signed quotation; the quotation itself was not supplied. Confirm page names, content quantities, and commercial commitments before implementation.

## Purpose and users

Build a corporate website where prospective clients can understand Smart360's services and training programmes, submit enquiries, read published articles, and verify a certificate. Authorized staff maintain content, handle requests, and manage certificate records through a private dashboard.

## Confirmed technical constraints

- Styling: all UI components must be built using Tailwind CSS utility classes, including the public website, admin dashboard, forms, and certificate verification portal. Do not use CSS Modules or styled-components.
- Next.js 16 App Router and TypeScript with `strict: true` and `noUncheckedIndexedAccess: true`.
- Next.js Route Handlers implement HTTP APIs. The owner's Phase 3 request explicitly authorizes Server Actions for training/quote form submissions with React `useActionState`. No Fastify or custom server; other features retain the Route Handler approach.
- MySQL through local WAMP for development, accessed through Prisma ORM 7. Production hosting and database operations remain to be agreed.
- Zod validates all API inputs and forms, including server-side validation.

Repository inspection found Next.js 16.4.6, Prisma dependencies targeting 7.10.1, a MySQL datasource, and a starter `HealthCheck` model. Strict mode is present; `noUncheckedIndexedAccess` is not yet configured. Zod is not listed in current dependencies. These are observations, not completed foundation work.

## In scope: public website

The following route names and page grouping are proposed for approval:

| Page | Purpose |
| --- | --- |
| Home `/` | Company introduction, key services, programme highlights, and calls to action |
| About `/about` | Approved company profile, values, and credentials |
| Services `/services`, `/services/[slug]` | Published service catalogue and service details |
| Training `/programmes`, `/programmes/[slug]` | Published programme catalogue, details, and training request entry |
| Blog `/blog`, `/blog/[slug]` | Paginated published articles and individual posts |
| Gallery `/gallery` | Approved images with captions and alternative text |
| Contact `/contact` | Approved contact details and an enquiry form using the quote-request workflow |
| Request a Quote `/request-quote` | Structured service enquiry |
| Verify Certificate `/verify` | Exact certificate-code lookup and a minimal verification result |
| Privacy `/privacy` | Owner-approved explanation of data collection, use, and retention |

Include responsive layouts, accessible navigation and forms, loading/empty/error states, basic page metadata, sitemap, robots rules, and appropriate not-found pages. Published content alone appears publicly. No fabricated testimonials, accreditations, client names, or contact information.

## In scope: admin dashboard

- Private staff login, logout, expiring sessions, and server-enforced permissions.
- Manage blog posts, services, programmes, and gallery records; draft/published controls for public content.
- List and inspect training and quote/contact requests; update their handling status.
- Create, inspect, correct, and revoke certificate records; expiry derives from dates.
- A small overview showing useful record/request counts, without a separate analytics product.
- Provision staff accounts through a controlled administrator process. No public registration. Proposed roles: `ADMIN` and `EDITOR`; see [security rules](./SECURITY.md).

## In scope: certificate verification

A visitor enters an exact, non-sequential verification code. The server validates and rate-limits the lookup, then reports valid, expired, revoked, or no match. Return only an approved recipient display name, programme/award title, issuer, issue date, optional expiry date, and status. Never expose contact details, internal notes, database IDs, or a public certificate directory. Revocation overrides validity; expired and revoked records must never appear valid.

## Out of scope

- Payments, checkout, invoicing, subscriptions, and paid course booking.
- Learning management, student accounts, attendance, examinations, and course delivery.
- Automatic PDF certificate generation, digital signatures, blockchain credentials, bulk imports, or certificate transfer between holders.
- CRM integrations, marketing automation, live chat, SMS, WhatsApp automation, and guaranteed email delivery. Persisted submissions are the baseline; email alerts require an approved provider and scope.
- Blog comments, public accounts, social login, multilingual content, advanced search, or a general drag-and-drop page builder.
- Custom analytics, payroll, inventory, surveillance systems, or security incident operations.
- Unbounded content entry, copywriting, photography, historical data cleanup, and third-party purchases. Agree initial content quantities separately.
- Hosting procurement, production migration, or live deployment without an agreed target and authorization. Deployment preparation and handover are included in Phase 6.

## Decisions needed before affected work

Confirm the signed quotation against this scope; approve branding, copy, page list, initial content quantities, staff permissions, certificate-code policy, recipient disclosure, retention periods, and certificate expiry/revocation rules. Agree media storage and upload limits, production host, backup ownership, and any notification provider. Missing decisions block their dependent work, not unrelated approved work.

## Delivery and acceptance

Follow [implementation phases](./IMPLEMENTATION_PHASES.md), [conceptual data model](./DATABASE_SCHEMA.md), [security checklist](./SECURITY.md), and [agent rules](./AGENTS_CONFIG.md). Acceptance requires the agreed public journeys, staff operations, negative access tests, safe verification results, and documented handover evidence. This documentation session does not authorize Phase 0 or certify that any planned behavior already works.
