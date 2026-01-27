'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { YearlyGoal, Area } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addYearlyGoal, editYearlyGoal, removeYearlyGoal } from '@/app/actions/yearly'
import { MindMapModal } from '@/components/mind-map/mind-map-modal'

interface YearlyGoalsListProps {
  goals: YearlyGoal[]
  year: number
  area: Area
  visionId?: string
  maxItems?: number
}

export function YearlyGoalsList({ goals, year, area, visionId, maxItems = 5 }: YearlyGoalsListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [mindMapGoalId, setMindMapGoalId] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setLoading(true)
    try {
      await addYearlyGoal(year, area, newTitle.trim(), visionId)
      toast.success('目標を追加しました')
      setNewTitle('')
      setIsAdding(false)
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (goalId: string) => {
    if (!editTitle.trim()) return

    setLoading(true)
    try {
      await editYearlyGoal(goalId, editTitle.trim())
      toast.success('更新しました')
      setEditingId(null)
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (goalId: string) => {
    setLoading(true)
    try {
      await removeYearlyGoal(goalId)
      toast('削除しました')
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (goal: YearlyGoal) => {
    setEditingId(goal.id)
    setEditTitle(goal.title)
  }

  return (
    <div className="space-y-2">
      {goals.length === 0 && !isAdding && (
        <p className="text-sm text-calm-400 py-2">目標が設定されていません</p>
      )}

      {goals.map((goal, index) => (
        <div key={goal.id} className="group flex items-center gap-2">
          <span className="text-calm-300 text-sm w-6">{index + 1}.</span>
          {editingId === goal.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEdit(goal.id)
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
              <span className="flex-1 text-calm-700">{goal.title}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button
                  onClick={() => setMindMapGoalId(goal.id)}
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
                  onClick={() => startEditing(goal)}
                  className="text-calm-400 hover:text-calm-600"
                >
                  編集
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(goal.id)}
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
        <form onSubmit={handleAdd} className="flex gap-2 pl-6">
          <Input
            placeholder="新しい年間目標..."
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
        goals.length < maxItems && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="text-calm-400 ml-6"
          >
            + 目標を追加
          </Button>
        )
      )}

      {mindMapGoalId && (
        <MindMapModal
          open={!!mindMapGoalId}
          onClose={() => setMindMapGoalId(null)}
          entityType="goal"
          entityId={mindMapGoalId}
          title={goals.find((g) => g.id === mindMapGoalId)?.title || '目標'}
        />
      )}
    </div>
  )
}
