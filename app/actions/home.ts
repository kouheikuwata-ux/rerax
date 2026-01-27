'use server'

import { requireAuth } from '@/lib/auth'
import { getTodayFocusItems } from '@/lib/data/focus-items'
import { getCurrentMonthThemes } from '@/lib/data/month-themes'
import { getCurrentWeekPlan } from '@/lib/data/week-plans'
import { getCurrentYearPlanData } from '@/lib/data/yearly'
import { Area, FocusItem, MonthTheme, WeekPlan, YearlyVision, YearlyGoal } from '@/lib/types'

export interface HomeData {
  focusItems: FocusItem[]
  monthThemes: MonthTheme[]
  weekPlan: WeekPlan | null
  yearlyVision: YearlyVision | null
  yearlyGoals: YearlyGoal[]
}

export async function getHomeData(area: Area): Promise<HomeData> {
  const userId = await requireAuth()

  const [focusItems, monthThemes, weekPlan, yearlyData] = await Promise.all([
    getTodayFocusItems(userId, area),
    getCurrentMonthThemes(userId, area),
    getCurrentWeekPlan(userId),
    getCurrentYearPlanData(userId, area),
  ])

  return {
    focusItems,
    monthThemes,
    weekPlan,
    yearlyVision: yearlyData.vision,
    yearlyGoals: yearlyData.goals,
  }
}
