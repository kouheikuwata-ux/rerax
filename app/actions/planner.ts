'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { generatePlan, PlannerResult } from '@/lib/planner'
import { PlannerInput, ProposedFocusItem } from '@/lib/types'
import { getCurrentMonthThemes } from '@/lib/data/month-themes'
import { getCurrentWeekPlan } from '@/lib/data/week-plans'
import { getRecentFocusItems, createFocusItem } from '@/lib/data/focus-items'
import { getRecentReflections } from '@/lib/data/reflections'
import { getTodayStr, getCurrentWeekStartStr, getCurrentMonthStr } from '@/lib/date-utils'

export async function generateProposal(): Promise<PlannerResult> {
  const userId = await requireAuth()

  // Gather current state
  const [monthThemes, weekPlan, recentFocusItems, recentReflections] = await Promise.all([
    getCurrentMonthThemes(userId),
    getCurrentWeekPlan(userId),
    getRecentFocusItems(userId, 7),
    getRecentReflections(userId, 3),
  ])

  const input: PlannerInput = {
    monthThemes: monthThemes.map((t) => ({
      id: t.id,
      userId: t.userId,
      month: t.month,
      title: t.title,
      order: t.order,
    })),
    weekPlan: weekPlan
      ? {
          id: weekPlan.id,
          userId: weekPlan.userId,
          weekStart: weekPlan.weekStart,
          weekMap: weekPlan.weekMap,
        }
      : null,
    recentFocusItems: recentFocusItems.map((f) => ({
      id: f.id,
      userId: f.userId,
      date: f.date,
      title: f.title,
      duration: f.duration,
      load: f.load,
      deadlineDate: f.deadlineDate,
      themeId: f.themeId,
      intention: f.intention,
      status: f.status,
      order: f.order,
    })),
    recentReflections: recentReflections.map((r) => ({
      id: r.id,
      userId: r.userId,
      date: r.date,
      result: r.result,
      reasonCode: r.reasonCode,
      note: r.note,
    })),
    targetDate: getTodayStr(),
  }

  return generatePlan(input)
}

export async function adoptProposal(proposedItems: ProposedFocusItem[]): Promise<void> {
  const userId = await requireAuth()
  const today = getTodayStr()

  // Create focus items from proposal
  for (const item of proposedItems) {
    await createFocusItem(userId, {
      date: today,
      title: item.title,
      duration: item.duration,
      load: item.load,
      themeId: item.themeId,
      intention: item.intention,
    })
  }

  revalidatePath('/')
}
