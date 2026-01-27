'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addFocusItem } from '@/app/actions/focus'
import { getTodayStr } from '@/lib/date-utils'
import { Duration, Load, Area } from '@/lib/types'

interface AddFocusFormProps {
  area: Area
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddFocusForm({ area, onSuccess, onCancel }: AddFocusFormProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState<Duration>(30)
  const [load, setLoad] = useState<Load>(3)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await addFocusItem({
        date: getTodayStr(),
        area,
        title: title.trim(),
        duration,
        load,
      })
      toast.success('追加しました')
      setTitle('')
      onSuccess?.()
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="今日のフォーカスを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-calm-500 mb-1">時間</label>
          <div className="flex gap-1">
            {([5, 10, 30, 60] as Duration[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                  duration === d
                    ? 'bg-accent text-white'
                    : 'bg-calm-100 text-calm-600 hover:bg-calm-200'
                }`}
              >
                {d === 60 ? '1h' : `${d}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-xs text-calm-500 mb-1">負荷</label>
          <div className="flex gap-1">
            {([1, 2, 3, 4, 5] as Load[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLoad(l)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                  load === l
                    ? 'bg-accent text-white'
                    : 'bg-calm-100 text-calm-600 hover:bg-calm-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={!title.trim()}>
          追加
        </Button>
      </div>
    </form>
  )
}
