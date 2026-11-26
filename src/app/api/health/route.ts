import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.strictObject({});
const responseOptions = { headers: { "Cache-Control": "no-store" } };

export async function GET(request: Request) {
  // This manual development probe writes a row; never expose it in production.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { ...responseOptions, status: 404 },
    );
  }

  const query = Object.fromEntries(new URL(request.url).searchParams);
  if (!querySchema.safeParse(query).success) {
    return NextResponse.json(
      { ok: false, error: "Query parameters are not supported" },
      { ...responseOptions, status: 400 },
    );
  }

  try {
    const row = await prisma.healthCheck.create({ data: {} });
    return NextResponse.json(
      { ok: true, message: "Database connected", id: row.id },
      responseOptions,
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database failed" },
      { ...responseOptions, status: 503 },
    );
  }
}
