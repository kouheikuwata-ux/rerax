'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  updateYearlyVision,
  createYearlyGoal,
  updateYearlyGoal,
  deleteYearlyGoal,
} from '@/lib/data/yearly'
import { YearlyVision, YearlyGoal, Area } from '@/lib/types'

export async function setYearlyVision(
  year: number,
  area: Area,
  title: string,
  keywords?: string
): Promise<YearlyVision> {
  const userId = await requireAuth()
  const vision = await updateYearlyVision(userId, year, area, title, keywords)
  revalidatePath('/')
  return vision
}

export async function addYearlyGoal(
  year: number,
  area: Area,
  title: string,
  visionId?: string
): Promise<YearlyGoal> {
  const userId = await requireAuth()
  const goal = await createYearlyGoal(userId, { year, area, title, visionId })
  revalidatePath('/')
  return goal
}

export async function editYearlyGoal(
  goalId: string,
  title: string
): Promise<YearlyGoal> {
  const userId = await requireAuth()
  const goal = await updateYearlyGoal(userId, goalId, title)
  revalidatePath('/')
  return goal
}

export async function removeYearlyGoal(goalId: string): Promise<void> {
  const userId = await requireAuth()
  await deleteYearlyGoal(userId, goalId)
  revalidatePath('/')
}
