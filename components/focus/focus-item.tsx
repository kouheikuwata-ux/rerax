'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import { FocusItem as FocusItemType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { completeFocusItem, skipFocusItem, removeFocusItem } from '@/app/actions/focus'
import { MindMapModal } from '@/components/mind-map/mind-map-modal'

interface FocusItemProps {
  item: FocusItemType
  onUpdate?: () => void
}

const durationLabels: Record<number, string> = {
  5: '5分',
  10: '10分',
  30: '30分',
  60: '1時間',
}

const loadLabels: Record<number, string> = {
  1: '軽',
  2: '軽め',
  3: '普通',
  4: 'やや重',
  5: '重',
}

export function FocusItemCard({ item, onUpdate }: FocusItemProps) {
  const [loading, setLoading] = useState(false)
  const [mindMapOpen, setMindMapOpen] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      await completeFocusItem(item.id)
      toast.success('完了しました')
      onUpdate?.()
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      await skipFocusItem(item.id)
      toast('スキップしました')
      onUpdate?.()
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await removeFocusItem(item.id)
      toast('削除しました')
      onUpdate?.()
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const isDone = item.status === 'done'
  const isSkipped = item.status === 'skipped'

  return (
    <div
      className={clsx(
        'group relative rounded-lg border p-4 transition-all',
        isDone && 'border-green-200 bg-green-50/50',
        isSkipped && 'border-calm-200 bg-calm-50 opacity-60',
        !isDone && !isSkipped && 'border-calm-200 bg-white hover:border-calm-300'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4
            className={clsx(
              'font-medium text-calm-800',
              isDone && 'line-through text-calm-500'
            )}
          >
            {item.title}
          </h4>
          {item.intention && (
            <p className="mt-1 text-sm text-calm-500">{item.intention}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="muted">{durationLabels[item.duration]}</Badge>
            <Badge variant="muted">負荷: {loadLabels[item.load]}</Badge>
            {isDone && <Badge variant="success">完了</Badge>}
            {isSkipped && <Badge variant="muted">スキップ</Badge>}
            <button
              onClick={() => setMindMapOpen(true)}
              className="ml-1 p-1 text-calm-400 hover:text-accent hover:bg-calm-100 rounded transition-colors"
              title="マインドマップ"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <circle cx="19" cy="5" r="2" />
                <circle cx="5" cy="5" r="2" />
                <circle cx="19" cy="19" r="2" />
                <circle cx="5" cy="19" r="2" />
                <path d="M12 9V5.5" />
                <path d="M14.5 10.5 17 7" />
                <path d="M9.5 10.5 7 7" />
                <path d="M14.5 13.5 17 17" />
                <path d="M9.5 13.5 7 17" />
              </svg>
            </button>
          </div>
        </div>

        {!isDone && !isSkipped && (
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleComplete}
              disabled={loading}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              完了
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSkip}
              disabled={loading}
              className="text-calm-500"
            >
              スキップ
            </Button>
          </div>
        )}

        {(isDone || isSkipped) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            className="opacity-0 group-hover:opacity-100 text-calm-400 hover:text-red-500"
          >
            削除
          </Button>
        )}
      </div>

      <MindMapModal
        open={mindMapOpen}
        onClose={() => setMindMapOpen(false)}
        entityType="focus"
        entityId={item.id}
        title={item.title}
      />
    </div>
  )
}
