// Quick script to check if admin user exists in DB
// Run: npx ts-node --esm prisma/check-admin.ts
import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
  const users = await db.user.findMany({ select: { id: true, nis: true, role: true, name: true } })
  console.log("Total users in DB:", users.length)
  users.forEach((u) => console.log(" -", u.nis ?? "(null)", "|", u.role, "|", u.name))

  // Check admin
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } })
  console.log("\nAdmin:", admin ? `NIS=${admin.nis}, name=${admin.name}` : "TIDAK ADA")

  await db.$disconnect()
  await pool.end()
}

main().catch(console.error)