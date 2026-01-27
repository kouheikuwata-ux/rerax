'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  createMonthTheme,
  updateMonthTheme,
  deleteMonthTheme,
} from '@/lib/data/month-themes'
import { MonthTheme, Area } from '@/lib/types'

export async function addMonthTheme(month: string, area: Area, title: string): Promise<MonthTheme> {
  const userId = await requireAuth()
  const theme = await createMonthTheme(userId, { month, area, title })
  revalidatePath('/')
  return theme
}

export async function editMonthTheme(themeId: string, title: string): Promise<MonthTheme> {
  const userId = await requireAuth()
  const theme = await updateMonthTheme(userId, themeId, title)
  revalidatePath('/')
  return theme
}

export async function removeMonthTheme(themeId: string): Promise<void> {
  const userId = await requireAuth()
  await deleteMonthTheme(userId, themeId)
  revalidatePath('/')
}
