import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const db = new PrismaClient({ adapter })

  const user = await db.user.findUnique({
    where: { nis: "ALA-01" },
    select: { id: true, nis: true, passwordHash: true, role: true }
  })

  if (!user) {
    console.log("ERROR: Admin user not found in DB")
    await db.$disconnect()
    await pool.end()
    return
  }

  console.log("Admin user:", JSON.stringify(user))

  if (!user.passwordHash) {
    console.log("ERROR: passwordHash is null")
    await db.$disconnect()
    await pool.end()
    return
  }

  const valid = await bcrypt.compare("admin123", user.passwordHash)
  console.log("Password 'admin123' valid:", valid)
  console.log("Auth should work:", valid)

  await db.$disconnect()
  await pool.end()
}

main().catch(e => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
