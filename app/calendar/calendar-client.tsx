'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { FocusItem, Area, AREA_LABELS } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarTabs, CalendarTab } from '@/components/ui/calendar-tabs'
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { getCalendarData, addCalendarFocusItem } from '@/app/actions/calendar'
import {
  getEventsForMonth,
  getEventsForDate,
  EVENT_CATEGORY_COLORS,
  JapaneseEvent,
  EventCategory,
} from '@/lib/japanese-events'

const DAY_NAMES = ['月', '火', '水', '木', '金', '土', '日']

export function CalendarClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tab, setTab] = useState<CalendarTab>('private')
  const [focusItems, setFocusItems] = useState<FocusItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [selectedArea, setSelectedArea] = useState<Area>('private')
  const [selectedEvents, setSelectedEvents] = useState<JapaneseEvent[]>([])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Set<EventCategory>>(
    () => new Set<EventCategory>([
      'holiday', 'seasonal', 'cultural', 'commercial', 'sports',
      'food', 'school', 'business', 'astronomy', 'health',
      'travel', 'entertainment', 'anniversary', 'spiritual', 'family', 'other'
    ])
  )

  // Fetch data for the current month (only for private/work tabs)
  useEffect(() => {
    async function fetchData() {
      if (tab === 'events') {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        const data = await getCalendarData(monthStart, monthEnd, tab as Area)
        setFocusItems(data)
      } catch (error) {
        toast.error('データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [currentMonth, tab])

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handleToday = () => setCurrentMonth(new Date())

  const handleDayClick = (day: Date) => {
    if (tab === 'events') {
      const events = getEventsForDate(day.getFullYear(), day.getMonth() + 1, day.getDate())
      if (events.length > 0) {
        setSelectedDate(day)
        setSelectedEvents(events)
        setIsEventModalOpen(true)
      }
    } else {
      setSelectedDate(day)
      setSelectedArea(tab as Area)
      setIsAddModalOpen(true)
    }
  }

  const handleAddItem = async () => {
    if (!selectedDate || !newItemTitle.trim()) return

    setIsAdding(true)
    try {
      await addCalendarFocusItem({
        date: format(selectedDate, 'yyyy-MM-dd'),
        area: selectedArea,
        title: newItemTitle.trim(),
      })
      toast.success('追加しました')
      setNewItemTitle('')
      setIsAddModalOpen(false)
      // Refresh data
      if (selectedArea === tab) {
        const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        const data = await getCalendarData(monthStart, monthEnd, tab as Area)
        setFocusItems(data)
      }
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setIsAdding(false)
    }
  }

  const toggleCategory = (category: EventCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  // Group focus items by date
  const itemsByDate = focusItems.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, FocusItem[]>)

  // Get events for the current month
  const monthEvents = getEventsForMonth(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
  const eventsByDate = monthEvents.reduce((acc, { date, event }) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(event)
    return acc
  }, {} as Record<string, JapaneseEvent[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-calm-800">カレンダー</h1>
          <p className="text-calm-500">スケジュールを確認・追加</p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">← ホームに戻る</Button>
        </Link>
      </header>

      {/* Calendar Tabs */}
      <CalendarTabs value={tab} onChange={setTab} />

      {/* Category Filter (Events tab only) */}
      {tab === 'events' && (
        <div className="flex flex-wrap gap-2">
          {(Object.entries(EVENT_CATEGORY_COLORS) as [EventCategory, typeof EVENT_CATEGORY_COLORS[EventCategory]][]).map(
            ([category, colors]) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  selectedCategories.has(category)
                    ? `${colors.bg} ${colors.text}`
                    : 'bg-calm-100 text-calm-400'
                )}
              >
                {colors.label}
              </button>
            )
          )}
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          ← 前月
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-calm-800">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </h2>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            今月
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          翌月 →
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((name, i) => (
            <div
              key={name}
              className={clsx(
                'text-center text-sm font-medium py-2',
                i === 5 && 'text-blue-500',
                i === 6 && 'text-red-500',
                i < 5 && 'text-calm-600'
              )}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-calm-50 rounded animate-pulse" />
            ))}
          </div>
        ) : tab === 'events' ? (
          // Events Calendar View
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayDate) => {
              const dateStr = format(dayDate, 'yyyy-MM-dd')
              const dayEvents = (eventsByDate[dateStr] || []).filter((e) =>
                selectedCategories.has(e.category)
              )
              const isCurrentMonth = isSameMonth(dayDate, currentMonth)
              const isTodayDate = isToday(dayDate)
              const dayOfWeek = (dayDate.getDay() + 6) % 7

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dayDate)}
                  disabled={dayEvents.length === 0}
                  className={clsx(
                    'min-h-24 p-2 rounded-lg text-left transition-all',
                    'hover:bg-calm-100 focus:outline-none focus:ring-2 focus:ring-accent/30',
                    isCurrentMonth ? 'bg-white' : 'bg-calm-50/50',
                    isTodayDate && 'ring-2 ring-accent',
                    dayEvents.length === 0 && 'cursor-default hover:bg-white'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={clsx(
                        'text-sm font-medium',
                        !isCurrentMonth && 'text-calm-300',
                        isCurrentMonth && dayOfWeek === 5 && 'text-blue-500',
                        isCurrentMonth && dayOfWeek === 6 && 'text-red-500',
                        isCurrentMonth && dayOfWeek < 5 && 'text-calm-700',
                        isTodayDate && 'bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center'
                      )}
                    >
                      {format(dayDate, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, idx) => {
                      const colors = EVENT_CATEGORY_COLORS[event.category]
                      return (
                        <div
                          key={idx}
                          className={clsx(
                            'text-xs px-1.5 py-0.5 rounded truncate',
                            colors.bg,
                            colors.text
                          )}
                          title={event.name}
                        >
                          {event.name}
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-calm-400">
                        +{dayEvents.length - 3}件
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          // Focus Items Calendar View
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayDate) => {
              const dateStr = format(dayDate, 'yyyy-MM-dd')
              const dayItems = itemsByDate[dateStr] || []
              const isCurrentMonth = isSameMonth(dayDate, currentMonth)
              const isTodayDate = isToday(dayDate)
              const dayOfWeek = (dayDate.getDay() + 6) % 7

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dayDate)}
                  className={clsx(
                    'min-h-24 p-2 rounded-lg text-left transition-all',
                    'hover:bg-calm-100 focus:outline-none focus:ring-2 focus:ring-accent/30',
                    isCurrentMonth ? 'bg-white' : 'bg-calm-50/50',
                    isTodayDate && 'ring-2 ring-accent'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={clsx(
                        'text-sm font-medium',
                        !isCurrentMonth && 'text-calm-300',
                        isCurrentMonth && dayOfWeek === 5 && 'text-blue-500',
                        isCurrentMonth && dayOfWeek === 6 && 'text-red-500',
                        isCurrentMonth && dayOfWeek < 5 && 'text-calm-700',
                        isTodayDate && 'bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center'
                      )}
                    >
                      {format(dayDate, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className={clsx(
                          'text-xs px-1.5 py-0.5 rounded truncate',
                          item.status === 'done' && 'bg-green-100 text-green-700 line-through',
                          item.status === 'skipped' && 'bg-calm-100 text-calm-400 line-through',
                          item.status === 'planned' && 'bg-accent-light text-accent-dark'
                        )}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-calm-400">
                        +{dayItems.length - 3}件
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      {/* Legend */}
      {tab === 'events' ? (
        <div className="flex flex-wrap justify-center gap-3 text-xs text-calm-500">
          {(Object.entries(EVENT_CATEGORY_COLORS) as [EventCategory, typeof EVENT_CATEGORY_COLORS[EventCategory]][]).map(
            ([category, colors]) => (
              <span key={category} className="flex items-center gap-1">
                <span className={clsx('w-3 h-3 rounded', colors.bg)} />
                {colors.label}
              </span>
            )
          )}
        </div>
      ) : (
        <div className="flex justify-center gap-4 text-xs text-calm-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-accent-light rounded" /> 予定
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 rounded" /> 完了
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-calm-100 rounded" /> スキップ
          </span>
        </div>
      )}

      {/* Add Item Modal */}
      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>
            {selectedDate && format(selectedDate, 'M月d日(E)', { locale: ja })}に追加
          </ModalTitle>
        </ModalHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-calm-600 mb-2">エリア</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedArea('private')}
                className={clsx(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedArea === 'private'
                    ? 'bg-accent text-white'
                    : 'bg-calm-100 text-calm-600 hover:bg-calm-200'
                )}
              >
                プライベート
              </button>
              <button
                type="button"
                onClick={() => setSelectedArea('work')}
                className={clsx(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedArea === 'work'
                    ? 'bg-accent text-white'
                    : 'bg-calm-100 text-calm-600 hover:bg-calm-200'
                )}
              >
                仕事
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-calm-600 mb-1">
              フォーカス
            </label>
            <Input
              placeholder="やることを入力..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleAddItem} loading={isAdding} disabled={!newItemTitle.trim()}>
            追加
          </Button>
        </ModalFooter>
      </Modal>

      {/* Event Detail Modal */}
      <Modal open={isEventModalOpen} onClose={() => setIsEventModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>
            {selectedDate && format(selectedDate, 'M月d日(E)', { locale: ja })}のイベント
          </ModalTitle>
        </ModalHeader>
        <div className="space-y-3">
          {selectedEvents.map((event, idx) => {
            const colors = EVENT_CATEGORY_COLORS[event.category]
            return (
              <div
                key={idx}
                className={clsx('p-3 rounded-lg', colors.bg)}
              >
                <div className="flex items-center gap-2">
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full bg-white/50', colors.text)}>
                    {colors.label}
                  </span>
                  <span className={clsx('font-medium', colors.text)}>{event.name}</span>
                </div>
                {event.description && (
                  <p className={clsx('mt-1 text-sm opacity-80', colors.text)}>
                    {event.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsEventModalOpen(false)}>
            閉じる
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
