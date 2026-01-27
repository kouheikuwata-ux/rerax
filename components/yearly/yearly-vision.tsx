'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { YearlyVision, Area } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { setYearlyVision } from '@/app/actions/yearly'
import { MindMapModal } from '@/components/mind-map/mind-map-modal'

interface YearlyVisionCardProps {
  vision: YearlyVision | null
  year: number
  area: Area
  onUpdate?: () => void
}

export function YearlyVisionCard({ vision, year, area, onUpdate }: YearlyVisionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(vision?.title || '')
  const [keywords, setKeywords] = useState(vision?.keywords || '')
  const [loading, setLoading] = useState(false)
  const [mindMapOpen, setMindMapOpen] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      await setYearlyVision(year, area, title.trim(), keywords.trim() || undefined)
      toast.success('ビジョンを保存しました')
      setIsEditing(false)
      onUpdate?.()
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <Input
          placeholder="今年のビジョン・テーマ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <Input
          placeholder="キーワード（カンマ区切り）"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false)
              setTitle(vision?.title || '')
              setKeywords(vision?.keywords || '')
            }}
          >
            キャンセル
          </Button>
          <Button size="sm" onClick={handleSave} loading={loading}>
            保存
          </Button>
        </div>
      </div>
    )
  }

  if (!vision) {
    return (
      <div className="text-center py-4">
        <p className="text-calm-400 text-sm mb-3">
          ビジョンを設定しましょう
        </p>
        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
          ビジョンを設定
        </Button>
      </div>
    )
  }

  return (
    <div className="group">
      <p className="text-lg font-medium text-calm-800">{vision.title}</p>
      {vision.keywords && (
        <p className="mt-1 text-sm text-calm-500">
          {vision.keywords.split(',').map((kw, i) => (
            <span key={i} className="inline-block mr-2">
              #{kw.trim()}
            </span>
          ))}
        </p>
      )}
      <div className="mt-2 flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-calm-400"
        >
          編集
        </Button>
        <button
          onClick={() => setMindMapOpen(true)}
          className="p-1 text-calm-400 hover:text-accent hover:bg-calm-100 rounded transition-colors opacity-0 group-hover:opacity-100"
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
      <MindMapModal
        open={mindMapOpen}
        onClose={() => setMindMapOpen(false)}
        entityType="vision"
        entityId={vision.id}
        title={vision.title}
      />
    </div>
  )
}
