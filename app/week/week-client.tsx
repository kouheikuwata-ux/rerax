'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { WeekPlan, DaySlot } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DAY_NAMES_JA, isDateToday, formatDateJa, parseDate } from '@/lib/date-utils'
import { updateDaySlotAction, updateWeeklyGoalAction } from '@/app/actions/week'

interface WeekDetailClientProps {
  initialWeekPlan: WeekPlan
  dateRange: string
}

export function WeekDetailClient({
  initialWeekPlan,
  dateRange,
}: WeekDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [weekPlan, setWeekPlan] = useState(initialWeekPlan)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(weekPlan.weekMap.weeklyGoal || '')

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleUpdateDay = async (
    dayOfWeek: number,
    updates: Partial<Omit<DaySlot, 'dayOfWeek' | 'date'>>
  ) => {
    try {
      const updated = await updateDaySlotAction(
        weekPlan.weekStart,
        dayOfWeek,
        updates
      )
      setWeekPlan(updated)
      setEditingDay(null)
      toast.success('更新しました')
    } catch (error) {
      toast.error('エラーが発生しました')
    }
  }

  const handleUpdateGoal = async () => {
    try {
      const updated = await updateWeeklyGoalAction(
        weekPlan.weekStart,
        goalInput.trim() || undefined
      )
      setWeekPlan(updated)
      setEditingGoal(false)
      toast.success('更新しました')
    } catch (error) {
      toast.error('エラーが発生しました')
    }
  }

  const toggleRest = async (dayOfWeek: number, currentIsRest: boolean) => {
    await handleUpdateDay(dayOfWeek, { isRest: !currentIsRest })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            ← 戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-calm-800">今週の流れ</h1>
          <p className="text-sm text-calm-500">{dateRange}</p>
        </div>
      </header>

      {/* Weekly Goal */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-calm-600">週の目標</span>
          {!editingGoal && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingGoal(true)}
              className="text-calm-400"
            >
              編集
            </Button>
          )}
        </div>

        {editingGoal ? (
          <div className="mt-2 flex gap-2">
            <Input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="今週の目標を入力..."
              className="flex-1"
              autoFocus
            />
            <Button size="sm" onClick={handleUpdateGoal}>
              保存
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingGoal(false)
                setGoalInput(weekPlan.weekMap.weeklyGoal || '')
              }}
            >
              ×
            </Button>
          </div>
        ) : (
          <p className="mt-1 text-calm-700">
            {weekPlan.weekMap.weeklyGoal || (
              <span className="text-calm-400">未設定</span>
            )}
          </p>
        )}
      </Card>

      {/* Day Slots */}
      <div className="space-y-3">
        {weekPlan.weekMap.days.map((day, index) => (
          <DaySlotCard
            key={day.date}
            day={day}
            dayName={DAY_NAMES_JA[index]}
            isEditing={editingDay === index}
            onStartEdit={() => setEditingDay(index)}
            onCancelEdit={() => setEditingDay(null)}
            onUpdate={(updates) => handleUpdateDay(index, updates)}
            onToggleRest={() => toggleRest(index, day.isRest)}
          />
        ))}
      </div>
    </div>
  )
}

interface DaySlotCardProps {
  day: DaySlot
  dayName: string
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onUpdate: (updates: Partial<Omit<DaySlot, 'dayOfWeek' | 'date'>>) => void
  onToggleRest: () => void
}

function DaySlotCard({
  day,
  dayName,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onToggleRest,
}: DaySlotCardProps) {
  const [focusInput, setFocusInput] = useState(day.focusTitle || '')
  const [noteInput, setNoteInput] = useState(day.note || '')

  const isToday = isDateToday(day.date)
  const dateFormatted = formatDateJa(parseDate(day.date), 'd日')
  const isWeekend = day.dayOfWeek >= 5

  const handleSave = () => {
    onUpdate({
      focusTitle: focusInput.trim() || undefined,
      note: noteInput.trim() || undefined,
    })
  }

  return (
    <Card
      className={clsx(
        'p-4 transition-all',
        isToday && 'ring-2 ring-accent ring-offset-2',
        day.isRest && 'bg-calm-50 opacity-75'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Day Label */}
        <div className="flex-shrink-0 w-12 text-center">
          <div
            className={clsx(
              'text-lg font-bold',
              isToday ? 'text-accent' : isWeekend ? 'text-calm-400' : 'text-calm-700'
            )}
          >
            {dayName}
          </div>
          <div className="text-xs text-calm-400">{dateFormatted}</div>
          {isToday && <Badge className="mt-1 text-[10px]">今日</Badge>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                placeholder="この日のフォーカス..."
                autoFocus
              />
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="メモ（任意）"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                  キャンセル
                </Button>
                <Button size="sm" onClick={handleSave}>
                  保存
                </Button>
              </div>
            </div>
          ) : day.isRest ? (
            <p className="text-calm-400 italic">休み</p>
          ) : (
            <div className="group">
              <p
                className={clsx(
                  'text-calm-700',
                  !day.focusTitle && 'text-calm-400 italic'
                )}
              >
                {day.focusTitle || '未設定'}
              </p>
              {day.note && (
                <p className="mt-1 text-sm text-calm-500">{day.note}</p>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onStartEdit}
                className="mt-2 opacity-0 group-hover:opacity-100 text-calm-400"
              >
                編集
              </Button>
            </div>
          )}
        </div>

        {/* Rest Toggle */}
        <button
          type="button"
          onClick={onToggleRest}
          className={clsx(
            'flex-shrink-0 w-8 h-8 rounded-full border-2 transition-colors',
            day.isRest
              ? 'border-calm-400 bg-calm-200 text-calm-600'
              : 'border-calm-200 text-calm-300 hover:border-calm-400'
          )}
          title={day.isRest ? '休みを解除' : '休みにする'}
        >
          {day.isRest ? '休' : '○'}
        </button>
      </div>
    </Card>
  )
}
