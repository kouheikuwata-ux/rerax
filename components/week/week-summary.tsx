'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { clsx } from 'clsx'
import { FocusItem, WeekPlan } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { getCalendarData } from '@/app/actions/calendar'
import {
  getEventsForDate,
  EVENT_CATEGORY_COLORS,
  JapaneseEvent,
} from '@/lib/japanese-events'

interface WeekSummaryProps {
  weekPlan: WeekPlan | null
}

const DAY_NAMES = ['月', '火', '水', '木', '金', '土', '日']

export function WeekSummary({ weekPlan }: WeekSummaryProps) {
  const [weekItems, setWeekItems] = useState<Record<string, FocusItem[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  // 今週の日付を取得（月曜始まり）
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    async function fetchWeekData() {
      setIsLoading(true)
      try {
        const startDate = format(weekDays[0], 'yyyy-MM-dd')
        const endDate = format(weekDays[6], 'yyyy-MM-dd')

        // 仕事のアイテムを取得
        const workItems = await getCalendarData(startDate, endDate, 'work')

        // 日付ごとにグループ化
        const itemsByDate: Record<string, FocusItem[]> = {}
        workItems.forEach((item) => {
          if (!itemsByDate[item.date]) itemsByDate[item.date] = []
          itemsByDate[item.date].push(item)
        })

        setWeekItems(itemsByDate)
      } catch (error) {
        console.error('Failed to fetch week data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWeekData()
  }, [])

  return (
    <div>
      {weekPlan?.weekMap?.weeklyGoal && (
        <p className="text-sm text-calm-600 mb-3">{weekPlan.weekMap.weeklyGoal}</p>
      )}

      {/* 週間カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-0.5 mb-4">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayItems = weekItems[dateStr] || []
          const dayEvents = getEventsForDate(day.getFullYear(), day.getMonth() + 1, day.getDate())
          const isTodayDate = isToday(day)
          const dayOfWeek = index // 0=月, 5=土, 6=日

          // 表示するアイテム（最大2件）
          const visibleItems = dayItems.slice(0, 2)
          const visibleEvents = dayEvents.slice(0, Math.max(0, 2 - visibleItems.length))
          const totalCount = dayItems.length + dayEvents.length
          const overflowCount = totalCount - 2

          return (
            <div
              key={dateStr}
              className={clsx(
                'min-h-[80px] p-1 rounded-lg flex flex-col',
                isTodayDate ? 'bg-accent/10 ring-1 ring-accent' : 'bg-calm-50',
              )}
            >
              {/* 日付ヘッダー */}
              <div className="flex items-center justify-center mb-1">
                <span
                  className={clsx(
                    'text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full',
                    dayOfWeek === 5 && 'text-blue-500',
                    dayOfWeek === 6 && 'text-red-500',
                    dayOfWeek < 5 && 'text-calm-600',
                    isTodayDate && 'bg-accent text-white'
                  )}
                >
                  {format(day, 'd')}
                </span>
                <span
                  className={clsx(
                    'text-[10px] ml-0.5',
                    dayOfWeek === 5 && 'text-blue-400',
                    dayOfWeek === 6 && 'text-red-400',
                    dayOfWeek < 5 && 'text-calm-400'
                  )}
                >
                  {DAY_NAMES[index]}
                </span>
              </div>

              {/* イベント表示エリア */}
              <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                {isLoading ? (
                  <div className="h-4 bg-calm-100 rounded animate-pulse" />
                ) : (
                  <>
                    {/* Focus Items */}
                    {visibleItems.map((item) => (
                      <div
                        key={item.id}
                        className={clsx(
                          'text-[9px] px-1 py-0.5 rounded truncate leading-tight',
                          item.status === 'done' && 'bg-green-100 text-green-700 line-through',
                          item.status === 'skipped' && 'bg-calm-100 text-calm-400 line-through',
                          item.status === 'planned' && 'bg-blue-100 text-blue-700'
                        )}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                    {/* Japanese Events */}
                    {visibleEvents.map((event, idx) => {
                      const colors = EVENT_CATEGORY_COLORS[event.category]
                      return (
                        <div
                          key={`event-${idx}`}
                          className={clsx(
                            'text-[9px] px-1 py-0.5 rounded truncate leading-tight',
                            colors.bg,
                            colors.text
                          )}
                          title={event.name}
                        >
                          {event.name}
                        </div>
                      )
                    })}
                    {/* オーバーフロー表示 */}
                    {overflowCount > 0 && (
                      <div className="text-[9px] text-calm-400 text-center">
                        +{overflowCount}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 凡例 */}
      <div className="flex justify-center gap-3 text-[10px] text-calm-500 mb-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-accent-light rounded" /> プライベート
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-100 rounded" /> 仕事
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-100 rounded" /> 完了
        </span>
      </div>

      <Link href="/week">
        <Button variant="secondary" className="w-full">
          週間プランを見る →
        </Button>
      </Link>
    </div>
  )
}
