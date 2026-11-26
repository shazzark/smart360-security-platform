# Database schema — implemented inventory

The following is the current [Prisma schema](../prisma/schema.prisma), not a conceptual proposal. Prisma ORM 7 uses MySQL through the MariaDB driver adapter and the server-only development singleton. Connection configuration lives in the Prisma configuration/environment, not this document. Run `npx prisma generate` after schema changes; never suppress missing-client-model errors.

## Models and relationships

| Model | Purpose and relationships |
| --- | --- |
| HealthCheck | Development-only database write probe; not a production health endpoint. |
| Service | Published consultancy catalogue; optional imageUrl; one-to-many QuoteRequest. |
| Programme | Published training catalogue with nullable duration/Decimal fee/currency; one-to-many TrainingRequest. |
| BlogPost | Plain-text content, excerpt, unique slug, published flag/date and optional imageUrl. No author relation exists. |
| GalleryImage | Independent curated media with publication state, alt text and optional caption. |
| TrainingRequest | Enquiry with required Programme foreign key and programme-title snapshot; deletion of referenced programme is restricted. |
| QuoteRequest | Enquiry with optional Service foreign key and service-title snapshot; general enquiries have no serviceId. Referenced service deletion is restricted. |
| User | Unique staff email, Argon2id hash, ADMIN/EDITOR role and active flag; one-to-many Session. |
| Session | Unique hashed random token identifier, staff/password/role binding, idle/absolute expiry; cascades when its user is deleted. |
| LoginThrottle | Shared hashed-key fixed-window login and separately namespaced upload quotas. |
| Certificate | Unique random public code, recipient/programme snapshots, UTC issue/optional expiry date and status; no catalogue foreign key. |
| VerificationThrottle | Shared hashed verification-client/global quota state. |
| Page | Unique slug, title and plain-text content. Public/edit entry points allow only about, contact and privacy. No timestamps, publication flag or owner relation are claimed. |

All scalar types, nullability, defaults, lengths, indexes and foreign keys are reproduced below. Prisma DateTime values are interpreted as UTC by application date logic. Certificate expiry is inclusive of its printed UTC date; revocation always prevents a valid result. RequestStatus is stored but no handling-status editor is delivered.

## Exact field definitions

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

 generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
}

model HealthCheck {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
}

model Page {
  id      String @id @default(cuid())
  slug    String @unique @db.VarChar(191)
  title   String @db.VarChar(191)
  content String @db.Text
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Service {
  imageUrl      String?       @db.VarChar(500)
  id            String        @id @default(cuid())
  title         String        @db.VarChar(191)
  slug          String        @unique @db.VarChar(191)
  summary       String        @db.VarChar(500)
  description   String        @db.Text
  featuredImage String?       @db.VarChar(500)
  imageAlt      String?       @db.VarChar(255)
  status        ContentStatus @default(DRAFT)
  sortOrder     Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  quoteRequests QuoteRequest[]

  @@index([status, sortOrder, id])
}

model Programme {
  imageUrl     String?       @db.VarChar(500)
  id           String        @id @default(cuid())
  title        String        @db.VarChar(191)
  slug         String        @unique @db.VarChar(191)
  summary      String        @db.VarChar(500)
  description  String        @db.Text
  duration     String?       @db.VarChar(100)
  price        Decimal?      @db.Decimal(12, 2)
  currency     String?       @db.Char(3)
  deliveryMode String?       @db.VarChar(100)
  status       ContentStatus @default(DRAFT)
  sortOrder    Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  trainingRequests TrainingRequest[]

  @@index([status, sortOrder, id])
}

model BlogPost {
  imageUrl      String?   @db.VarChar(500)
  id            String    @id @default(cuid())
  title         String    @db.VarChar(191)
  slug          String    @unique @db.VarChar(191)
  content       String    @db.Text
  excerpt       String    @db.VarChar(500)
  published     Boolean   @default(false)
  publishedAt   DateTime?
  coverImageUrl String?   @db.VarChar(500)
  coverImageAlt String?   @db.VarChar(255)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([published, publishedAt, id])
}

model GalleryImage {
  id        String        @id @default(cuid())
  title     String        @db.VarChar(191)
  url       String        @db.VarChar(500)
  altText   String        @db.VarChar(255)
  caption   String?       @db.VarChar(500)
  status    ContentStatus @default(DRAFT)
  sortOrder Int           @default(0)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([status, sortOrder, id])
}

enum RequestStatus {
  NEW
  IN_PROGRESS
  CLOSED
}

model TrainingRequest {
  id                String        @id @default(cuid())
  name              String        @db.VarChar(100)
  email             String        @db.VarChar(254)
  phone             String        @db.VarChar(20)
  programmeInterest String        @db.VarChar(191)
  programmeId       String        @db.VarChar(191)
  programme         Programme     @relation(fields: [programmeId], references: [id], onDelete: Restrict)
  message           String        @db.Text
  status            RequestStatus @default(NEW)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([programmeId])
  @@index([status, createdAt, id])
  @@index([email, createdAt])
}

model QuoteRequest {
  id              String        @id @default(cuid())
  name            String        @db.VarChar(100)
  email           String        @db.VarChar(254)
  phone           String        @db.VarChar(20)
  companyName     String?       @db.VarChar(191)
  serviceInterest String        @db.VarChar(191)
  serviceId       String?       @db.VarChar(191)
  service         Service?      @relation(fields: [serviceId], references: [id], onDelete: Restrict)
  message         String        @db.Text
  status          RequestStatus @default(NEW)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([serviceId])
  @@index([status, createdAt, id])
  @@index([email, createdAt])
}

enum Role {
  ADMIN
  EDITOR
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique @db.VarChar(191)
  passwordHash String    @db.VarChar(255)
  name         String    @db.VarChar(100)
  role         Role      @default(ADMIN)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
}

model Session {
  id                    String   @id @default(cuid())
  tokenHash             String   @unique @db.Char(64)
  userId                String   @db.VarChar(191)
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  passwordFingerprint   String   @db.Char(64)
  roleAtIssue           Role
  createdAt             DateTime @default(now())
  lastSeenAt            DateTime @default(now())
  expiresAt             DateTime

  @@index([userId])
  @@index([expiresAt])
}

model LoginThrottle {
  key             String   @id @db.Char(64)
  count           Int      @default(0)
  windowStartedAt DateTime

  @@index([windowStartedAt])
}

enum CertificateStatus {
  VALID
  REVOKED
  EXPIRED
}

model Certificate {
  id                String            @id @default(cuid())
  certificateNumber String            @unique @db.VarChar(64)
  recipientName     String            @db.VarChar(100)
  programmeName     String            @db.VarChar(191)
  issueDate         DateTime          @db.Date
  expiryDate        DateTime?         @db.Date
  status            CertificateStatus @default(VALID)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}

model VerificationThrottle {
  key             String   @id @db.Char(64)
  count           Int      @default(0)
  windowStartedAt DateTime

  @@index([windowStartedAt])
}

```

## Application rules and storage

- Content creation publishes explicitly. Public catalogue queries filter status or the blog published flag plus publishedAt <= now; displayed lists are bounded to 24. Drafts are not public.
- imageUrl is an optional validated Cloudinary HTTPS image URL. Legacy featuredImage/coverImage fields are preserved. Gallery combines published GalleryImage rows and published catalogue/blog uploads, deduplicates URLs and displays at most 24.
- Phase 8 stores image bytes in Cloudinary smart360_uploads, not MySQL or application disk. URLs are public immediately after upload. Content saves verify asset existence in the configured cloud. Record deletion retains cloud assets to avoid breaking shared references; reference-aware cleanup and coordinated database/media recovery remain operational requirements. No schema migration is required for this change.
- Page editors validate a supported slug, title length 2–191 and content length 20–10,000. Content is rendered as escaped plain-text paragraphs, never raw HTML. Saving revalidates the public route and the admin list. Seed upserts use empty updates so reruns preserve staff edits.
- Development mock seeding refuses production/non-local databases and preserves existing staff passwords. Production setup uses migrations plus controlled administrator provisioning; company page records/content must be supplied through an approved data operation, not the mock seed.
- Migrations are additive and preserve existing data. The historical request migration preserves InnoDB for foreign keys and serializable transactions. The Phase 6.5 new migration normalizes its own table identifiers for case-sensitive MySQL; see the session record. Rehearse full migration replay on the actual hosting database before launch.

See [security controls](./SECURITY.md), [setup](../README.md) and [verification history](./SESSION.md).