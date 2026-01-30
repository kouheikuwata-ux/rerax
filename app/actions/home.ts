'use server'

import { requireAuth } from '@/lib/auth'
import { getTodayFocusItems } from '@/lib/data/focus-items'
import { getCurrentMonthThemes } from '@/lib/data/month-themes'
import { getCurrentWeekPlan } from '@/lib/data/week-plans'
import { getCurrentYearPlanData } from '@/lib/data/yearly'
import { getDailyNotes } from '@/lib/data/daily-notes'
import { Area, FocusItem, MonthTheme, WeekPlan, YearlyVision, YearlyGoal, DailyNote } from '@/lib/types'

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

export interface HomeData {
  focusItems: FocusItem[]
  monthThemes: MonthTheme[]
  weekPlan: WeekPlan | null
  yearlyVision: YearlyVision | null
  yearlyGoals: YearlyGoal[]
  dailyNotes: DailyNote[]
}

export async function getHomeData(area: Area): Promise<HomeData> {
  const userId = await requireAuth()
  const today = getTodayDate()

  const [focusItems, monthThemes, weekPlan, yearlyData, dailyNotes] = await Promise.all([
    getTodayFocusItems(userId, area),
    getCurrentMonthThemes(userId, area),
    getCurrentWeekPlan(userId),
    getCurrentYearPlanData(userId, area),
    getDailyNotes(userId, today),
  ])

  return {
    focusItems,
    monthThemes,
    weekPlan,
    yearlyVision: yearlyData.vision,
    yearlyGoals: yearlyData.goals,
    dailyNotes,
  }
}
