'use client'

import Link from 'next/link'
import { WeekPlan, WeekMap } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { DAY_NAMES_JA, isDateToday } from '@/lib/date-utils'
import { clsx } from 'clsx'

interface WeekSummaryProps {
  weekPlan: WeekPlan | null
}

export function WeekSummary({ weekPlan }: WeekSummaryProps) {
  const weekMap = weekPlan?.weekMap

  return (
    <div>
      {weekMap?.weeklyGoal && (
        <p className="text-sm text-calm-600 mb-3">{weekMap.weeklyGoal}</p>
      )}

      <div className="flex gap-1 mb-4">
        {DAY_NAMES_JA.map((day, index) => {
          const slot = weekMap?.days[index]
          const isToday = slot ? isDateToday(slot.date) : false
          const hasContent = slot?.focusTitle && !slot.isRest
          const isRest = slot?.isRest

          return (
            <div
              key={day}
              className={clsx(
                'flex-1 py-2 px-1 rounded text-center text-xs transition-colors',
                isToday && 'ring-2 ring-accent ring-offset-1',
                isRest && 'bg-calm-100 text-calm-400',
                hasContent && !isRest && 'bg-accent-light text-accent-dark',
                !hasContent && !isRest && 'bg-calm-50 text-calm-400'
              )}
              title={slot?.focusTitle || (isRest ? '休み' : '未設定')}
            >
              <span className="font-medium">{day}</span>
              {hasContent && (
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent mx-auto" />
              )}
            </div>
          )
        })}
      </div>

      <Link href="/week">
        <Button variant="secondary" className="w-full">
          今週を見る →
        </Button>
      </Link>
    </div>
  )
}
