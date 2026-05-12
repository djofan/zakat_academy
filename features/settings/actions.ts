'use server'

import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getMaintenanceMode(): Promise<boolean> {
  const setting = await db.setting.findUnique({
    where: { key: 'maintenance_mode' }
  })
  return setting?.value === 'true'
}

export async function toggleMaintenanceMode(enabled: boolean) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  await db.setting.upsert({
    where: { key: 'maintenance_mode' },
    update: { value: enabled ? 'true' : 'false' },
    create: { key: 'maintenance_mode', value: enabled ? 'true' : 'false' },
  })

  revalidatePath('/admin/settings')
  return { success: true }
}