'use server'

import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const createStudentSchema = z.object({
  name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }).optional().or(z.literal('')),
  no_hp: z.string().min(4, { message: 'No HP minimal 4 angka' }),
  gender: z.enum(['IKHWAN', 'AKHWAT']),
  nis: z.string()
  .min(1, { message: 'NIS tidak boleh kosong' })
  .regex(/^LA[NT]-\d{5}$/, { message: 'Format NIS: LAN-26001' }),
})

export async function createStudent(data: {
  name: string
  email?: string
  no_hp: string
  nis: string
  gender: 'IKHWAN' | 'AKHWAT'
}) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const parsed = createStudentSchema.safeParse(data)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const firstError = Object.values(errors)[0]?.[0]
    return { error: firstError ?? 'Data tidak valid' }
  }

   // Cek NIS sudah dipakai
  const existingNis = await db.user.findUnique({
    where: { nis: parsed.data.nis }
  })
  if (existingNis) {
    return { error: 'NIS sudah digunakan student lain' }
  }

  // Cek no_hp sudah dipakai
const existingPhone = await db.user.findUnique({
  where: { no_hp: parsed.data.no_hp }
})
if (existingPhone) {
  return { error: 'No HP sudah terdaftar' }
}

  // Cek email sudah dipakai (kalau diisi)
  if (parsed.data.email) {
    const existingEmail = await db.user.findUnique({
      where: { email: parsed.data.email }
    })
    if (existingEmail) {
      return { error: 'Email sudah terdaftar' }
    }
  }

  // Password = 4 angka terakhir no HP
  const rawPassword = parsed.data.no_hp.slice(-4)
  const passwordHash = await bcrypt.hash(rawPassword, 12)

  await db.user.create({
  data: {
    name: parsed.data.name,
    email: parsed.data.email || undefined,
    no_hp: parsed.data.no_hp,
    nis: parsed.data.nis,
    gender: parsed.data.gender,
    passwordHash,
    role: 'STUDENT',
  }
})

  revalidatePath('/admin/users')
  return { success: true, password: rawPassword }
}

const nisSchema = z.object({
  userId: z.string().min(1),
  nis: z.string()
  .min(1, { message: 'NIS tidak boleh kosong' })
  .regex(/^LA[NT]-\d{5}$/, { message: 'Format NIS: LAN-26001 atau LAT-26001' }),
})

export async function updateUserNis(userId: string, nis: string) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const parsed = nisSchema.safeParse({ userId, nis })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.nis?.[0] ?? 'NIS tidak valid' }
  }

  const existing = await db.user.findFirst({
    where: { nis, NOT: { id: userId } }
  })
  if (existing) {
    return { error: 'NIS sudah digunakan student lain' }
  }

  await db.user.update({
    where: { id: userId },
    data: { nis },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getLastStudentNis(gender: 'IKHWAN' | 'AKHWAT'): Promise<string | null> {
  const prefix = gender === 'IKHWAN' ? 'LAN-' : 'LAT-'
  const last = await db.user.findFirst({
    where: {
      role: 'STUDENT',
      gender: gender,
      nis: { startsWith: prefix },
    },
    orderBy: { nis: 'desc' },
    select: { nis: true }
  })
  return last?.nis ?? null
}

export async function updateCertificateUrl(userId: string, url: string) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  await db.user.update({
    where: { id: userId },
    data: { certificateUrl: url || null },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function importStudentsFromExcel(data: {
  name: string
  no_hp: string
  gender: 'IKHWAN' | 'AKHWAT'
  email?: string
}[]) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const results: { name: string; nis: string; password: string; status: 'success' | 'error'; message?: string }[] = []

  // Ambil NIS terakhir per gender
  let lastNisIkhwan = await getLastStudentNis('IKHWAN')
  let lastNisAkhwat = await getLastStudentNis('AKHWAT')

  for (const student of data) {
    try {
      // Validasi
      if (!student.name || !student.no_hp || !student.gender) {
        results.push({ name: student.name ?? '-', nis: '-', password: '-', status: 'error', message: 'Data tidak lengkap' })
        continue
      }

      // Generate NIS
      const lastNis = student.gender === 'IKHWAN' ? lastNisIkhwan : lastNisAkhwat
      const code = student.gender === 'IKHWAN' ? 'I' : 'A'
      const lastNum = lastNis ? parseInt(lastNis.split('-')[3]) : 0
      const newNum = String(lastNum + 1).padStart(5, '0')
      const nis = `LA-26-${code}-${newNum}`

      // Update last NIS
      if (student.gender === 'IKHWAN') lastNisIkhwan = nis
      else lastNisAkhwat = nis

      // Cek duplikat no HP
      const existingPhone = await db.user.findUnique({ where: { no_hp: student.no_hp } })
      if (existingPhone) {
        results.push({ name: student.name, nis, password: '-', status: 'error', message: 'No HP sudah terdaftar' })
        continue
      }

      // Cek duplikat email
      if (student.email) {
        const existingEmail = await db.user.findUnique({ where: { email: student.email } })
        if (existingEmail) {
          results.push({ name: student.name, nis, password: '-', status: 'error', message: 'Email sudah terdaftar' })
          continue
        }
      }

      // Hash password
      const rawPassword = student.no_hp.slice(-4)
      const passwordHash = await bcrypt.hash(rawPassword, 12)

      // Buat akun
      await db.user.create({
        data: {
          name: student.name,
          no_hp: student.no_hp,
          email: student.email || undefined,
          gender: student.gender,
          nis,
          passwordHash,
          role: 'STUDENT',
        }
      })

      results.push({ name: student.name, nis, password: rawPassword, status: 'success' })

    } catch (err) {
      results.push({ name: student.name ?? '-', nis: '-', password: '-', status: 'error', message: 'Gagal membuat akun' })
    }
  }

  revalidatePath('/admin/users')
  return { results }
}