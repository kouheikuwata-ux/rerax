'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  updateDaySlot,
  updateWeeklyGoal,
  getOrCreateWeekPlan,
} from '@/lib/data/week-plans'
import { WeekPlan, DaySlot } from '@/lib/types'

export async function getWeekPlanAction(weekStart: string): Promise<WeekPlan> {
  const userId = await requireAuth()
  return getOrCreateWeekPlan(userId, weekStart)
}

export async function updateDaySlotAction(
  weekStart: string,
  dayOfWeek: number,
  updates: Partial<Omit<DaySlot, 'dayOfWeek' | 'date'>>
): Promise<WeekPlan> {
  const userId = await requireAuth()
  const plan = await updateDaySlot(userId, weekStart, dayOfWeek, updates)
  revalidatePath('/')
  revalidatePath('/week')
  return plan
}

export async function updateWeeklyGoalAction(
  weekStart: string,
  weeklyGoal: string | undefined
): Promise<WeekPlan> {
  const userId = await requireAuth()
  const plan = await updateWeeklyGoal(userId, weekStart, weeklyGoal)
  revalidatePath('/')
  revalidatePath('/week')
  return plan
}
