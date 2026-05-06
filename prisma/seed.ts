import * as dotenv from 'dotenv'
dotenv.config()

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter })

async function main() {
  // Admin — NIS dari DB yang sudah ada
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await db.user.upsert({
    where: { nis: 'ALA-01' },
    update: {},
    create: {
      name: 'Admin LAZSIP',
      nis: 'ALA-01',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin:', admin.nis, '| password: admin123')

  // Sample students dari DB yang sudah ada
  const student1Password = await bcrypt.hash('1234', 12)
  await db.user.upsert({
    where: { nis: 'LA-26-I-00001' },
    update: { name: 'Jojo', no_hp: '08123456789', passwordHash: student1Password, role: 'STUDENT', gender: 'IKHWAN' },
    create: { name: 'Jojo', nis: 'LA-26-I-00001', no_hp: '08123456789', passwordHash: student1Password, role: 'STUDENT', gender: 'IKHWAN' },
  })
  console.log('Student: LA-26-I-00001 | password: 1234')

  const student2Password = await bcrypt.hash('6789', 12)
  await db.user.upsert({
    where: { nis: 'LA-26-I-00002' },
    update: { name: 'Ujang', no_hp: '08129876543', passwordHash: student2Password, role: 'STUDENT', gender: 'IKHWAN' },
    create: { name: 'Ujang', nis: 'LA-26-I-00002', no_hp: '08129876543', passwordHash: student2Password, role: 'STUDENT', gender: 'IKHWAN' },
  })
  console.log('Student: LA-26-I-00002 | password: 6789')
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })