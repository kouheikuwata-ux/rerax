import { Suspense } from 'react'
import Link from 'next/link'
import { getCurrentUserId } from '@/lib/auth'
import { getOrCreateWeekPlan } from '@/lib/data/week-plans'
import { getCurrentWeekStartStr, formatDateJa, getWeekStart, getWeekEnd, parseDate } from '@/lib/date-utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WeekDetailClient } from './week-client'

export const dynamic = 'force-dynamic'

async function WeekData() {
  const userId = getCurrentUserId()
  const weekStart = getCurrentWeekStartStr()

  const weekPlan = await getOrCreateWeekPlan(userId, weekStart)

  const weekStartDate = parseDate(weekStart)
  const weekEndDate = getWeekEnd(weekStartDate)
  const dateRange = `${formatDateJa(weekStartDate, 'M/d')} - ${formatDateJa(weekEndDate, 'M/d')}`

  return (
    <WeekDetailClient
      initialWeekPlan={weekPlan}
      dateRange={dateRange}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-8 w-8 bg-calm-200 rounded" />
        <div className="h-6 bg-calm-200 rounded w-48" />
      </div>

      <Card>
        <div className="animate-pulse space-y-4 p-5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-16 bg-calm-100 rounded" />
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function WeekPage() {
  return (
    <main>
      <Suspense fallback={<LoadingSkeleton />}>
        <WeekData />
      </Suspense>
    </main>
  )
}
