import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,  // ← penting untuk serverless
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);

export const db = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}