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
import { GoogleConnectButton } from '@/components/google-connect-button'
import { GoogleCalendarSync } from '@/components/google-calendar-sync'

const DAY_NAMES = ['月', '火', '水', '木', '金', '土', '日']

// EventPill - 改善されたイベント表示コンポーネント
function EventPill({
  title,
  colorClass,
  isCompleted = false,
}: {
  title: string
  colorClass: string
  isCompleted?: boolean
}) {
  return (
    <div
      className={clsx(
        'h-5 sm:h-6 px-2 text-xs sm:text-sm rounded-md truncate flex items-center',
        'min-w-0',
        colorClass,
        isCompleted && 'line-through opacity-70'
      )}
      title={title}
    >
      {title}
    </div>
  )
}

export function CalendarClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tab, setTab] = useState<CalendarTab>('all')
  const [focusItems, setFocusItems] = useState<FocusItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [selectedArea, setSelectedArea] = useState<Area>('work')
  const [selectedEvents, setSelectedEvents] = useState<JapaneseEvent[]>([])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  // DayAgendaModal用の状態
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDayItems, setSelectedDayItems] = useState<FocusItem[]>([])
  const [selectedDayEvents, setSelectedDayEvents] = useState<JapaneseEvent[]>([])
  // レスポンシブ表示件数
  const [maxVisibleItems, setMaxVisibleItems] = useState(3)
  const [selectedCategories, setSelectedCategories] = useState<Set<EventCategory>>(
    () => new Set<EventCategory>([
      'holiday', 'seasonal', 'cultural', 'commercial', 'sports',
      'food', 'school', 'business', 'astronomy', 'health',
      'travel', 'entertainment', 'anniversary', 'spiritual', 'family', 'other'
    ])
  )

  // レスポンシブ表示件数の監視
  useEffect(() => {
    const handleResize = () => {
      setMaxVisibleItems(window.innerWidth < 640 ? 2 : 3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch data for the current month
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

        if (tab === 'all') {
          // Fetch both private and work items
          const [privateData, workData] = await Promise.all([
            getCalendarData(monthStart, monthEnd, 'private'),
            getCalendarData(monthStart, monthEnd, 'work'),
          ])
          setFocusItems([...privateData, ...workData])
        } else {
          const data = await getCalendarData(monthStart, monthEnd, tab as Area)
          setFocusItems(data)
        }
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
    const dateStr = format(day, 'yyyy-MM-dd')
    setSelectedDate(day)

    if (tab === 'events') {
      // イベントタブの場合はイベントのみ表示
      const events = (eventsByDate[dateStr] || []).filter(e => selectedCategories.has(e.category))
      if (events.length > 0) {
        setSelectedEvents(events)
        setIsEventModalOpen(true)
      }
    } else {
      // その他のタブではDayAgendaModalを表示
      const items = itemsByDate[dateStr] || []
      const events = (eventsByDate[dateStr] || []).filter(e => selectedCategories.has(e.category))

      setSelectedDayItems(items)
      setSelectedDayEvents(tab === 'all' ? events : [])
      setSelectedArea(tab === 'all' ? 'private' : (tab as Area))
      setIsDayModalOpen(true)
    }
  }

  // DayAgendaModalから追加モーダルを開く
  const openAddModalFromDay = () => {
    setIsDayModalOpen(false)
    setIsAddModalOpen(true)
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
      if (tab === 'all' || selectedArea === tab) {
        const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
        if (tab === 'all') {
          const [privateData, workData] = await Promise.all([
            getCalendarData(monthStart, monthEnd, 'private'),
            getCalendarData(monthStart, monthEnd, 'work'),
          ])
          setFocusItems([...privateData, ...workData])
        } else {
          const data = await getCalendarData(monthStart, monthEnd, tab as Area)
          setFocusItems(data)
        }
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="space-y-3 px-2 sm:px-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-calm-800">カレンダー</h1>
            <p className="text-calm-500">スケジュールを確認・追加</p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">← ホームに戻る</Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <GoogleConnectButton />
          <GoogleCalendarSync
            startDate={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
            endDate={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
            onSyncComplete={() => {
              // Refresh calendar data after sync
              const fetchData = async () => {
                const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
                const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
                if (tab === 'all') {
                  const [privateData, workData] = await Promise.all([
                    getCalendarData(monthStart, monthEnd, 'private'),
                    getCalendarData(monthStart, monthEnd, 'work'),
                  ])
                  setFocusItems([...privateData, ...workData])
                } else if (tab !== 'events') {
                  const data = await getCalendarData(monthStart, monthEnd, tab as Area)
                  setFocusItems(data)
                }
              }
              fetchData()
            }}
          />
        </div>
      </header>

      {/* Calendar Tabs */}
      <div className="px-2 sm:px-0">
        <CalendarTabs value={tab} onChange={setTab} />
      </div>

      {/* Category Filter (Events and All tabs) */}
      {(tab === 'events' || tab === 'all') && (
        <div className="flex flex-wrap gap-2 px-2 sm:px-0">
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
      <div className="flex items-center justify-between px-2 sm:px-0">
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
      <Card className="p-0 sm:p-4 shadow-none sm:shadow-sm border-0 sm:border">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
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
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-[100px] sm:h-[120px] bg-calm-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tab === 'events' ? (
          // Events Calendar View
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((dayDate) => {
              const dateStr = format(dayDate, 'yyyy-MM-dd')
              const dayEvents = (eventsByDate[dateStr] || []).filter((e) =>
                selectedCategories.has(e.category)
              )
              const isCurrentMonth = isSameMonth(dayDate, currentMonth)
              const isTodayDate = isToday(dayDate)
              const dayOfWeek = (dayDate.getDay() + 6) % 7
              const overflowCount = dayEvents.length - maxVisibleItems

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dayDate)}
                  disabled={dayEvents.length === 0}
                  className={clsx(
                    'min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 rounded-lg text-left transition-all flex flex-col',
                    'hover:bg-calm-100 focus:outline-none focus:ring-2 focus:ring-accent/30',
                    isCurrentMonth ? 'bg-white' : 'bg-calm-50/50',
                    isTodayDate && 'bg-accent/10 ring-2 ring-accent',
                    !isCurrentMonth && 'opacity-40',
                    dayEvents.length === 0 && 'cursor-default hover:bg-white'
                  )}
                >
                  {/* 日付数字 */}
                  <div className="flex-shrink-0 mb-1">
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
                  {/* イベントエリア */}
                  <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                    {dayEvents.slice(0, maxVisibleItems).map((event, idx) => {
                      const colors = EVENT_CATEGORY_COLORS[event.category]
                      return (
                        <EventPill
                          key={idx}
                          title={event.name}
                          colorClass={`${colors.bg} ${colors.text}`}
                        />
                      )
                    })}
                    {overflowCount > 0 && (
                      <div className="h-5 text-xs text-calm-500 hover:text-calm-700 flex items-center">
                        +{overflowCount}件
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : tab === 'all' ? (
          // All View - Focus Items + Events
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((dayDate) => {
              const dateStr = format(dayDate, 'yyyy-MM-dd')
              const dayItems = itemsByDate[dateStr] || []
              const dayEvents = (eventsByDate[dateStr] || []).filter((e) =>
                selectedCategories.has(e.category)
              )
              const isCurrentMonth = isSameMonth(dayDate, currentMonth)
              const isTodayDate = isToday(dayDate)
              const dayOfWeek = (dayDate.getDay() + 6) % 7
              const totalItems = dayItems.length + dayEvents.length
              // Focus itemsを優先して表示、残りはevents
              const visibleItemCount = Math.min(dayItems.length, maxVisibleItems)
              const visibleEventCount = Math.max(0, maxVisibleItems - visibleItemCount)
              const overflowCount = totalItems - maxVisibleItems

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dayDate)}
                  className={clsx(
                    'min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 rounded-lg text-left transition-all flex flex-col',
                    'hover:bg-calm-100 focus:outline-none focus:ring-2 focus:ring-accent/30',
                    isCurrentMonth ? 'bg-white' : 'bg-calm-50/50',
                    isTodayDate && 'bg-accent/10 ring-2 ring-accent',
                    !isCurrentMonth && 'opacity-40'
                  )}
                >
                  {/* 日付数字 */}
                  <div className="flex-shrink-0 mb-1">
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
                  {/* イベントエリア */}
                  <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                    {/* Focus Items first */}
                    {dayItems.slice(0, visibleItemCount).map((item) => (
                      <EventPill
                        key={item.id}
                        title={item.title}
                        colorClass={clsx(
                          item.status === 'done' && 'bg-green-100 text-green-700',
                          item.status === 'skipped' && 'bg-calm-100 text-calm-400',
                          item.status === 'planned' && item.area === 'private' && 'bg-accent-light text-accent-dark',
                          item.status === 'planned' && item.area === 'work' && 'bg-blue-100 text-blue-700'
                        )}
                        isCompleted={item.status === 'done' || item.status === 'skipped'}
                      />
                    ))}
                    {/* Events */}
                    {dayEvents.slice(0, visibleEventCount).map((event, idx) => {
                      const colors = EVENT_CATEGORY_COLORS[event.category]
                      return (
                        <EventPill
                          key={`event-${idx}`}
                          title={event.name}
                          colorClass={`${colors.bg} ${colors.text}`}
                        />
                      )
                    })}
                    {overflowCount > 0 && (
                      <div className="h-5 text-xs text-calm-500 hover:text-calm-700 flex items-center">
                        +{overflowCount}件
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          // Focus Items Calendar View (private/work)
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((dayDate) => {
              const dateStr = format(dayDate, 'yyyy-MM-dd')
              const dayItems = itemsByDate[dateStr] || []
              const isCurrentMonth = isSameMonth(dayDate, currentMonth)
              const isTodayDate = isToday(dayDate)
              const dayOfWeek = (dayDate.getDay() + 6) % 7
              const overflowCount = dayItems.length - maxVisibleItems

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dayDate)}
                  className={clsx(
                    'min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 rounded-lg text-left transition-all flex flex-col',
                    'hover:bg-calm-100 focus:outline-none focus:ring-2 focus:ring-accent/30',
                    isCurrentMonth ? 'bg-white' : 'bg-calm-50/50',
                    isTodayDate && 'bg-accent/10 ring-2 ring-accent',
                    !isCurrentMonth && 'opacity-40'
                  )}
                >
                  {/* 日付数字 */}
                  <div className="flex-shrink-0 mb-1">
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
                  {/* イベントエリア */}
                  <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                    {dayItems.slice(0, maxVisibleItems).map((item) => (
                      <EventPill
                        key={item.id}
                        title={item.title}
                        colorClass={clsx(
                          item.status === 'done' && 'bg-green-100 text-green-700',
                          item.status === 'skipped' && 'bg-calm-100 text-calm-400',
                          item.status === 'planned' && 'bg-accent-light text-accent-dark'
                        )}
                        isCompleted={item.status === 'done' || item.status === 'skipped'}
                      />
                    ))}
                    {overflowCount > 0 && (
                      <div className="h-5 text-xs text-calm-500 hover:text-calm-700 flex items-center">
                        +{overflowCount}件
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
        <div className="flex flex-wrap justify-center gap-3 text-xs text-calm-500 px-2 sm:px-0">
          {(Object.entries(EVENT_CATEGORY_COLORS) as [EventCategory, typeof EVENT_CATEGORY_COLORS[EventCategory]][]).map(
            ([category, colors]) => (
              <span key={category} className="flex items-center gap-1">
                <span className={clsx('w-3 h-3 rounded', colors.bg)} />
                {colors.label}
              </span>
            )
          )}
        </div>
      ) : tab === 'all' ? (
        <div className="space-y-2 px-2 sm:px-0">
          <div className="flex justify-center gap-4 text-xs text-calm-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-100 rounded" /> 仕事
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-100 rounded" /> 完了
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-calm-400">
            {(Object.entries(EVENT_CATEGORY_COLORS) as [EventCategory, typeof EVENT_CATEGORY_COLORS[EventCategory]][]).slice(0, 6).map(
              ([category, colors]) => (
                <span key={category} className="flex items-center gap-1">
                  <span className={clsx('w-2 h-2 rounded', colors.bg)} />
                  {colors.label}
                </span>
              )
            )}
            <span>...</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-4 text-xs text-calm-500 px-2 sm:px-0">
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

      {/* Day Agenda Modal - 当日一覧モーダル */}
      <Modal open={isDayModalOpen} onClose={() => setIsDayModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>
            {selectedDate && format(selectedDate, 'M月d日(E)', { locale: ja })}
          </ModalTitle>
        </ModalHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {/* Focus Items */}
          {selectedDayItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-calm-600">予定</h4>
              {selectedDayItems.map((item) => (
                <div
                  key={item.id}
                  className={clsx(
                    'p-3 rounded-lg',
                    item.status === 'done' && 'bg-green-100',
                    item.status === 'skipped' && 'bg-calm-100',
                    item.status === 'planned' && item.area === 'private' && 'bg-accent-light',
                    item.status === 'planned' && item.area === 'work' && 'bg-blue-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded-full bg-white/50',
                        item.area === 'private' ? 'text-accent-dark' : 'text-blue-700'
                      )}
                    >
                      {item.area === 'private' ? 'プライベート' : '仕事'}
                    </span>
                    <span
                      className={clsx(
                        'font-medium',
                        item.status === 'done' && 'text-green-700 line-through',
                        item.status === 'skipped' && 'text-calm-400 line-through',
                        item.status === 'planned' && item.area === 'private' && 'text-accent-dark',
                        item.status === 'planned' && item.area === 'work' && 'text-blue-700'
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Events */}
          {selectedDayEvents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-calm-600">イベント</h4>
              {selectedDayEvents.map((event, idx) => {
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
          )}
          {/* 予定がない場合 */}
          {selectedDayItems.length === 0 && selectedDayEvents.length === 0 && (
            <div className="py-8 text-center text-calm-400">
              この日の予定はありません
            </div>
          )}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDayModalOpen(false)}>
            閉じる
          </Button>
          <Button onClick={openAddModalFromDay}>
            ＋ 追加
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
