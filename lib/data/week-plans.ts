import { prisma } from '@/lib/db'
import { WeekPlan, WeekMap, DaySlot } from '@/lib/types'
import {
  getCurrentWeekStartStr,
  getWeekDates,
  getWeekStart,
  formatDate
} from '@/lib/date-utils'

// Create empty week map for a given week start
export function createEmptyWeekMap(weekStart: Date): WeekMap {
  const dates = getWeekDates(weekStart)
  return {
    days: dates.map((date, index) => ({
      dayOfWeek: index,
      date: formatDate(date),
      focusTitle: undefined,
      note: undefined,
      isRest: index >= 5, // Saturday and Sunday default to rest
    })),
    weeklyGoal: undefined,
  }
}

export async function getWeekPlan(
  userId: string,
  weekStart: string
): Promise<WeekPlan | null> {
  const plan = await prisma.weekPlan.findUnique({
    where: {
      userId_weekStart: { userId, weekStart },
    },
  })

  if (!plan) return null

  return {
    ...plan,
    weekMap: JSON.parse(plan.weekMap) as WeekMap,
  }
}

export async function getCurrentWeekPlan(userId: string): Promise<WeekPlan | null> {
  return getWeekPlan(userId, getCurrentWeekStartStr())
}

export async function getOrCreateWeekPlan(
  userId: string,
  weekStart: string
): Promise<WeekPlan> {
  const existing = await getWeekPlan(userId, weekStart)
  if (existing) return existing

  const weekStartDate = new Date(weekStart)
  const emptyMap = createEmptyWeekMap(weekStartDate)

  const plan = await prisma.weekPlan.create({
    data: {
      userId,
      weekStart,
      weekMap: JSON.stringify(emptyMap),
    },
  })

  return {
    ...plan,
    weekMap: emptyMap,
  }
}

export async function updateWeekPlan(
  userId: string,
  weekStart: string,
  weekMap: WeekMap
): Promise<WeekPlan> {
  const plan = await prisma.weekPlan.upsert({
    where: {
      userId_weekStart: { userId, weekStart },
    },
    update: {
      weekMap: JSON.stringify(weekMap),
    },
    create: {
      userId,
      weekStart,
      weekMap: JSON.stringify(weekMap),
    },
  })

  return {
    ...plan,
    weekMap,
  }
}

export async function updateDaySlot(
  userId: string,
  weekStart: string,
  dayOfWeek: number,
  updates: Partial<Omit<DaySlot, 'dayOfWeek' | 'date'>>
): Promise<WeekPlan> {
  const plan = await getOrCreateWeekPlan(userId, weekStart)

  const updatedMap: WeekMap = {
    ...plan.weekMap,
    days: plan.weekMap.days.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
    ),
  }

  return updateWeekPlan(userId, weekStart, updatedMap)
}

export async function updateWeeklyGoal(
  userId: string,
  weekStart: string,
  weeklyGoal: string | undefined
): Promise<WeekPlan> {
  const plan = await getOrCreateWeekPlan(userId, weekStart)

  const updatedMap: WeekMap = {
    ...plan.weekMap,
    weeklyGoal,
  }

  return updateWeekPlan(userId, weekStart, updatedMap)
}
