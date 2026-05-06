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
    .regex(/^LA-\d{2}-(I|A)-\d{5}$/, { message: 'Format NIS: LA-26-I-00001' }),
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
    .regex(/^LA-\d{2}-(I|A)-\d{5}$/, { message: 'Format NIS: LA-26-I-00001 atau LA-26-A-00001' }),
})

export async function updateUserNis(data: {
  userId: string
  nis: string
}) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const parsed = nisSchema.safeParse(data)

  if (!parsed.success) {
    const errors = parsed.error.flatten().formErrors
    const firstError = errors[0]
    return { error: firstError ?? 'Data tidak valid' }
  }

  const existingNis = await db.user.findFirst({
    where: {
      nis: parsed.data.nis,
      NOT: {
        id: parsed.data.userId,
      },
    },
  })

  if (existingNis) {
    return { error: 'NIS sudah digunakan student lain' }
  }

  await db.user.update({
    where: {
      id: parsed.data.userId,
    },
    data: {
      nis: parsed.data.nis,
    },
  })

  revalidatePath('/admin/users')

  return { success: true }
}

export async function getLastStudentNis(gender: 'IKHWAN' | 'AKHWAT'): Promise<string | null> {
  const last = await db.user.findFirst({
    where: {
      role: 'STUDENT',
      gender: gender,
      nis: { startsWith: `LA-` },
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