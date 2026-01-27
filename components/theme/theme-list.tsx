'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { MonthTheme, YearlyGoal, Area } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addMonthTheme, editMonthTheme, removeMonthTheme } from '@/app/actions/themes'
import { getCurrentMonthStr } from '@/lib/date-utils'
import { MindMapModal } from '@/components/mind-map/mind-map-modal'

interface ThemeListProps {
  themes: MonthTheme[]
  yearlyGoals?: YearlyGoal[]
  area: Area
  maxItems?: number
}

export function ThemeList({ themes, yearlyGoals, area, maxItems = 5 }: ThemeListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [mindMapThemeId, setMindMapThemeId] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setLoading(true)
    try {
      await addMonthTheme(getCurrentMonthStr(), area, newTitle.trim())
      toast.success('テーマを追加しました')
      setNewTitle('')
      setIsAdding(false)
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (themeId: string) => {
    if (!editTitle.trim()) return

    setLoading(true)
    try {
      await editMonthTheme(themeId, editTitle.trim())
      toast.success('更新しました')
      setEditingId(null)
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (themeId: string) => {
    setLoading(true)
    try {
      await removeMonthTheme(themeId)
      toast('削除しました')
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (theme: MonthTheme) => {
    setEditingId(theme.id)
    setEditTitle(theme.title)
  }

  return (
    <div className="space-y-2">
      {themes.length === 0 && !isAdding && (
        <p className="text-sm text-calm-400 py-2">テーマが設定されていません</p>
      )}

      {themes.map((theme) => (
        <div key={theme.id} className="group flex items-center gap-2">
          {editingId === theme.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEdit(theme.id)
              }}
              className="flex-1 flex gap-2"
            >
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="flex-1"
              />
              <Button size="sm" type="submit" loading={loading}>
                保存
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => setEditingId(null)}
              >
                ×
              </Button>
            </form>
          ) : (
            <>
              <span className="flex-1 text-calm-700">{theme.title}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button
                  onClick={() => setMindMapThemeId(theme.id)}
                  className="p-1 text-calm-400 hover:text-accent hover:bg-calm-100 rounded transition-colors"
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditing(theme)}
                  className="text-calm-400 hover:text-calm-600"
                >
                  編集
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(theme.id)}
                  className="text-calm-400 hover:text-red-500"
                >
                  削除
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {isAdding ? (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="新しいテーマ..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="flex-1"
          />
          <Button size="sm" type="submit" loading={loading}>
            追加
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => {
              setIsAdding(false)
              setNewTitle('')
            }}
          >
            ×
          </Button>
        </form>
      ) : (
        themes.length < maxItems && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="text-calm-400"
          >
            + テーマを追加
          </Button>
        )
      )}

      {mindMapThemeId && (
        <MindMapModal
          open={!!mindMapThemeId}
          onClose={() => setMindMapThemeId(null)}
          entityType="theme"
          entityId={mindMapThemeId}
          title={themes.find((t) => t.id === mindMapThemeId)?.title || 'テーマ'}
        />
      )}
    </div>
  )
}
