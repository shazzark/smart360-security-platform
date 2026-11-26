import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/passwords";
import { newCertificateNumber } from "../src/lib/certificates";
import { initialPages } from "./page-content";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Mock seeding is disabled in production.");
  }
  if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL ?? "").hostname)) {
    throw new Error("Mock/admin seeding requires a local development database.");
  }
  // Explicitly requested development credentials only; never replace an existing staff password.
  const passwordHash = await hashPassword("password123");
  await prisma.user.upsert({ where: { email: "admin@smart360.com" }, update: {}, create: { email: "admin@smart360.com", name: "Smart360 Administrator", passwordHash, role: "ADMIN" } });

  // Stable mock IDs and empty updates make reruns safe without replacing edited content.
  await prisma.$transaction(async (tx) => {
    for (const page of initialPages) {
      await tx.page.upsert({ where: { slug: page.slug }, update: {}, create: page });
    }
    for (let index = 1; index <= 3; index++) {
      await tx.certificate.upsert({ where: { id: `mock-certificate-${index}` }, update: {}, create: { id: `mock-certificate-${index}`, certificateNumber: newCertificateNumber(), recipientName: `Mock Recipient ${index}`, programmeName: "Mock Security Awareness", issueDate: new Date("2026-01-01T00:00:00Z"), expiryDate: new Date("2030-12-31T00:00:00Z"), status: index === 3 ? "REVOKED" : "VALID" } });
    }
    const services = [
      { slug: "mock-security-review", title: "Security review", description: "Mock service: a structured review of site access, procedures, and potential security gaps." },
      { slug: "mock-risk-planning", title: "Risk planning", description: "Mock service: identify priorities and outline practical measures for organisational preparedness." },
      { slug: "mock-security-advisory", title: "Security advisory", description: "Mock service: discuss security procedures and develop a clear plan for the next steps." },
    ];
    for (const [index, service] of services.entries()) {
      await tx.service.upsert({
        where: { slug: service.slug }, update: {},
        create: { id: `mock-service-${index + 1}`, ...service, summary: service.description, status: "PUBLISHED", sortOrder: index },
      });
    }

    const programmes = [
      { slug: "mock-security-awareness", title: "Security awareness", duration: "1 day (illustrative)", description: "Mock programme: an introduction to everyday security awareness and reporting concerns." },
      { slug: "mock-incident-preparedness", title: "Incident preparedness", duration: "2 days (illustrative)", description: "Mock programme: explore communication, responsibilities, and preparation for incident response." },
      { slug: "mock-team-supervision", title: "Security team supervision", duration: "3 days (illustrative)", description: "Mock programme: consider team coordination, briefing routines, and operational oversight." },
    ];
    for (const [index, programme] of programmes.entries()) {
      await tx.programme.upsert({
        where: { slug: programme.slug }, update: {},
        create: { id: `mock-programme-${index + 1}`, ...programme, summary: programme.description, status: "PUBLISHED", sortOrder: index },
      });
    }

    const posts = [
      { slug: "mock-everyday-security-awareness", title: "Everyday security awareness", excerpt: "Mock article: simple prompts for discussing awareness with your team.", content: "Illustrative content only. Review your reporting channels, keep contact information current, and discuss responsibilities with your team.", published: true, publishedAt: new Date("2026-11-20T09:00:00Z") },
      { slug: "mock-preparing-a-team-briefing", title: "Preparing a team briefing", excerpt: "Mock article: a starting point for a clear and useful security briefing.", content: "Illustrative content only. A briefing can clarify the purpose, the people involved, and the next steps. Replace this sample with reviewed company content.", published: true, publishedAt: new Date("2026-11-24T09:00:00Z") },
      { slug: "mock-unpublished-draft", title: "Unpublished mock draft", excerpt: "This draft must never appear on public pages.", content: "Private mock draft for publication-filter verification.", published: false, publishedAt: null },
    ];
    for (const [index, post] of posts.entries()) {
      await tx.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: { id: `mock-post-${index + 1}`, ...post } });
    }

    const gallery = [
      { title: "Training workshop", name: "training" },
      { title: "Site review", name: "site-review" },
      { title: "Team briefing", name: "briefing" },
      { title: "Planning session", name: "planning" },
    ];
    for (const [index, image] of gallery.entries()) {
      const id = `mock-gallery-${index + 1}`;
      await tx.galleryImage.upsert({
        where: { id }, update: {},
        create: { id, title: image.title, url: `/images/mock-${image.name}.svg`, altText: `Illustrative placeholder for ${image.title.toLowerCase()}, not a company photograph`, caption: "Mock illustration — approved photographs to follow.", status: "PUBLISHED", sortOrder: index },
      });
    }
  }, { timeout: 30000 });
  console.log("Mock seed complete: 3 company pages, 3 services, 3 programmes, 2 published posts, 1 private draft, and 4 gallery illustrations. Existing content was preserved.");
}

main()
  .catch(() => {
    console.error("Mock seed failed. Check the local database connection and applied migrations.");
    process.exitCode = 1;
  })
  .finally(async () => { await prisma.$disconnect(); });
