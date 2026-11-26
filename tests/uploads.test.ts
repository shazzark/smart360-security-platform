import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, test, mock } from "node:test";
import { Writable } from "node:stream";
import type { UploadApiOptions, UploadApiResponse, UploadResponseCallback } from "cloudinary";
import sharp from "sharp";
import { ImageInputError, processImage, saveImage, storedImageExists, uploadOriginAllowed } from "../src/lib/uploads";
import { cloudinaryClient } from "../src/lib/cloudinary";
import { MAX_IMAGE_BYTES, imageUploadSchema, uploadedImageSchema, publicImageSource } from "../src/lib/validations/image-schema";
import { contentSchema } from "../src/lib/validations/admin-schemas";
import { prisma } from "../src/lib/prisma";

before(() => {
  if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL ?? "").hostname)) throw new Error("Local development environment required.");
});
after(async () => { await prisma.$disconnect(); });

test("upload validation rejects SVG, disguised content, excess bytes, extra fields and URL traversal", async () => {
  const origin = process.env.SITE_URL || "http://localhost";
  assert.equal(uploadOriginAllowed(new Request("http://localhost/api/upload", { headers: { Origin: new URL(origin).origin } })), true);
  assert.equal(uploadOriginAllowed(new Request("http://localhost/api/upload", { headers: { Origin: "https://untrusted.example.invalid" } })), false);
  assert.equal(uploadOriginAllowed(new Request("http://localhost/api/upload")), false);
  const bad = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  assert.equal(imageUploadSchema.safeParse({ file: new File([bad], "test.svg", { type: "image/svg+xml" }) }).success, false);
  await assert.rejects(processImage(bad, "image/jpeg"), ImageInputError);
  await assert.rejects(processImage(Buffer.alloc(MAX_IMAGE_BYTES + 1), "image/png"), ImageInputError);
  assert.equal(imageUploadSchema.safeParse({ file: new File([bad], "test.png", { type: "image/png" }), extra: "field" }).success, false);
  assert.equal(uploadedImageSchema.safeParse("/uploads/../secret.png").success, false);
  assert.equal(contentSchema.safeParse({ kind: "services", title: "Synthetic service", description: "Synthetic description.", imageUrl: "https://example.invalid/image.png" }).success, false);
  assert.equal(publicImageSource("javascript:alert(1)", "/images/mock-training.svg"), "/images/mock-training.svg");
});

test("real JPEG, PNG and WebP images are decoded, resized and re-encoded without metadata", async () => {
  for (const format of ["jpeg", "png", "webp"] as const) {
    const source = await sharp({ create: { width: 2600, height: 40, channels: 3, background: "#e5b85c" } }).toFormat(format).withMetadata().toBuffer();
    const result = await processImage(source, `image/${format}`);
    const metadata = await sharp(result.bytes).metadata();
    assert.equal(metadata.width, 2400);
    assert.equal(metadata.format, format);
    assert.equal(metadata.exif, undefined);
    if (format === "png") await assert.rejects(processImage(source, "image/jpeg"), ImageInputError);
  }
});

test("signed Cloudinary upload streams sanitized bytes and checks account ownership before publication", async () => {
  const source = await sharp({ create: { width: 80, height: 60, channels: 3, background: "#102436" } }).png().toBuffer();
  const previous = { name: process.env.CLOUDINARY_CLOUD_NAME, key: process.env.CLOUDINARY_API_KEY, secret: process.env.CLOUDINARY_API_SECRET };
  process.env.CLOUDINARY_CLOUD_NAME = " Test-Cloud ";
  process.env.CLOUDINARY_API_KEY = "synthetic-key";
  process.env.CLOUDINARY_API_SECRET = "synthetic-secret";
  const client = cloudinaryClient();
  let returnedUrl = "";
  const upload = mock.method(client.uploader, "upload_stream", ((options: UploadApiOptions, callback: UploadResponseCallback) => {
    assert.equal(options.folder, "smart360_uploads");
    assert.equal(options.overwrite, false);
    assert.equal(options.resource_type, "image");
    assert.match(String(options.public_id), /^[a-f0-9]{32}$/);
    returnedUrl = `https://res.cloudinary.com/test-cloud/image/upload/v1/smart360_uploads/${String(options.public_id)}.png`;
    const chunks: Buffer[] = [];
    return new Writable({ write(chunk: Buffer, _encoding, done) { chunks.push(chunk); done(); }, final(done) { assert.ok(Buffer.concat(chunks).length > 0); callback(undefined, { secure_url: returnedUrl } as UploadApiResponse); done(); } }) as unknown as ReturnType<typeof client.uploader.upload_stream>;
  }) as typeof client.uploader.upload_stream);
  const resource = mock.method(client.api, "resource", (async (id: string) => {
    assert.match(id, /^smart360_uploads\/[a-f0-9]{32}$/);
    return { secure_url: returnedUrl, resource_type: "image" };
  }) as typeof client.api.resource);
  try {
    const url = await saveImage(source, "image/png");
    assert.equal(uploadedImageSchema.safeParse(url).success, true);
    assert.equal(await storedImageExists(url), true);
    assert.equal(await storedImageExists(url.replace("test-cloud", "foreign-cloud")), false);
    assert.equal(uploadedImageSchema.safeParse(url + "?redirect=evil").success, false);
    assert.equal(uploadedImageSchema.safeParse(url.replace("res.cloudinary.com", "res.cloudinary.com.evil.invalid")).success, false);
    assert.equal(uploadedImageSchema.safeParse("/uploads/" + "a".repeat(32) + ".png").success, false);
    resource.mock.mockImplementation((async () => { throw Error("Synthetic provider failure"); }) as typeof client.api.resource);
    assert.equal(await storedImageExists(url), false);
  } finally {
    upload.mock.restore(); resource.mock.restore();
    for (const [key, value] of Object.entries({ CLOUDINARY_CLOUD_NAME: previous.name, CLOUDINARY_API_KEY: previous.key, CLOUDINARY_API_SECRET: previous.secret })) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
