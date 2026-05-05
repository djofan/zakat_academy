// Test NextAuth credentials flow
// Run: npx tsx prisma/test-auth.ts
import "dotenv/config"
import NextAuth from "next-auth"
import { authOptions } from "../lib/auth"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

// Mock the db import in auth.ts — we need to override it
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function testAuth() {
  // Simulate what authorize() does
  const nis = "ALA-01"
  const password = "admin123"

  const user = await db.user.findUnique({
    where: { nis },
    select: { id: true, nis: true, passwordHash: true, role: true, name: true, email: true, image: true },
  })

  console.log("User found:", user?.nis, "| role:", user?.role)

  if (!user) { console.log("No user — check NIS"); return }
  if (!user.passwordHash) { console.log("No hash"); return }

  // bcrypt compare
  const bcrypt = await import("bcryptjs")
  const isValid = await bcrypt.compare(password, user.passwordHash)
  console.log("Password valid:", isValid)

  if (!isValid) return

  // Now simulate the full NextAuth flow
  const handler = NextAuth(authOptions)
  console.log("AuthOptions loaded, provider:", authOptions.providers[0].name)

  // Check NEXTAUTH_SECRET
  console.log("NEXTAUTH_SECRET set:", !!process.env.NEXTAUTH_SECRET)

  await db.$disconnect()
  await pool.end()
}

testAuth().catch(console.error)