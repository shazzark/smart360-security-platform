import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const result = z.string().url().startsWith("mysql://").safeParse(
    process.env.DATABASE_URL,
  );

  if (!result.success) {
    throw new Error("DATABASE_URL must be configured with a MySQL connection URL.");
  }

  const adapter = new PrismaMariaDb(result.data);
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

// Reuse the client and its connection pool across development hot reloads.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
