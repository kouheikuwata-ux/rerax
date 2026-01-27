'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { createReflectionLog } from '@/lib/data/reflections'
import { ReflectionLog, ReflectionResult, ReasonCode } from '@/lib/types'

export async function addReflection(
  date: string,
  result: ReflectionResult,
  reasonCode?: ReasonCode,
  note?: string
): Promise<ReflectionLog> {
  const userId = await requireAuth()
  const reflection = await createReflectionLog(userId, {
    date,
    result,
    reasonCode,
    note,
  })
  revalidatePath('/')
  return reflection
}
