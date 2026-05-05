import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"
import "dotenv/config"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } })
  if (!admin) { console.log("NO ADMIN USER"); return }
  console.log("Admin NIS:", admin.nis)
  console.log("Hash exists:", !!admin.passwordHash)
  if (admin.passwordHash) {
    const valid = await bcrypt.compare("admin123", admin.passwordHash)
    console.log("Password 'admin123' valid:", valid)
  }

  const student = await db.user.findFirst({ where: { nis: "LA-26-I-00001" } })
  if (!student) { console.log("NO STUDENT"); return }
  console.log("Student NIS:", student.nis)
  if (student.passwordHash) {
    const valid = await bcrypt.compare("1234", student.passwordHash)
    console.log("Password '1234' valid:", valid)
  }

  await db.$disconnect()
  await pool.end()
}

main().catch(console.error)
