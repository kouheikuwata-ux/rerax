'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { DailyNote } from '@/lib/types'
import { getDailyNoteById, saveDailyNote, removeDailyNote } from '@/app/actions/daily-notes'
import { NoteEditor } from '@/components/daily-note/note-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Check, Loader2 } from 'lucide-react'

const CARD_COLORS = [
  { name: '白', value: '#ffffff' },
  { name: 'クリーム', value: '#fef9c3' },
  { name: 'ピンク', value: '#fce7f3' },
  { name: '水色', value: '#e0f2fe' },
  { name: 'ミント', value: '#d1fae5' },
  { name: 'ラベンダー', value: '#ede9fe' },
  { name: 'ピーチ', value: '#ffedd5' },
  { name: 'グレー', value: '#f3f4f6' },
]

export default function NoteEditorPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<DailyNote | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cardColor, setCardColor] = useState('#ffffff')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load note data
  useEffect(() => {
    async function loadNote() {
      try {
        const data = await getDailyNoteById(noteId)
        if (!data) {
          toast.error('メモが見つかりませんでした')
          router.push('/')
          return
        }
        setNote(data)
        setTitle(data.title || '')
        setContent(data.content)
        setCardColor(data.color || '#ffffff')
        setLastSaved(data.updatedAt)
      } catch (error) {
        toast.error('メモの読み込みに失敗しました')
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    loadNote()
  }, [noteId, router])

  // Auto-save function
  const saveNote = useCallback(
    async (newTitle: string, newContent: string, newColor: string) => {
      if (!note) return

      setIsSaving(true)
      try {
        await saveDailyNote(note.id, {
          title: newTitle || null,
          content: newContent,
          color: newColor,
        })
        setLastSaved(new Date())
      } catch (error) {
        toast.error('保存に失敗しました')
      } finally {
        setIsSaving(false)
      }
    },
    [note]
  )

  // Debounced save
  const debouncedSave = useCallback(
    (newTitle: string, newContent: string, newColor: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(newTitle, newContent, newColor)
      }, 1000)
    },
    [saveNote]
  )

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    debouncedSave(newTitle, content, cardColor)
  }

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    debouncedSave(title, newContent, cardColor)
  }

  // Handle color change
  const handleColorChange = (newColor: string) => {
    setCardColor(newColor)
    debouncedSave(title, content, newColor)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('このメモを削除しますか？')) return

    try {
      await removeDailyNote(noteId)
      toast.success('メモを削除しました')
      router.push('/')
    } catch (error) {
      toast.error('削除に失敗しました')
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-calm-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!note) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cardColor }}>
      {/* Header - Mobile optimized */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-calm-200 safe-area-inset">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1 touch-manipulation h-10 px-3">
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">戻る</span>
              </Button>
            </Link>
            <div className="text-xs sm:text-sm text-calm-500">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  保存中
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  保存済み
                </span>
              ) : null}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 touch-manipulation h-10 px-3"
          >
            <Trash2 className="h-5 w-5 sm:mr-1" />
            <span className="hidden sm:inline">削除</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Card Color Picker - Scrollable on mobile */}
        <div className="mb-4 sm:mb-6">
          <label className="text-xs sm:text-sm text-calm-500 block mb-2">カードの色</label>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            {CARD_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-transform active:scale-95 touch-manipulation flex-shrink-0 ${
                  cardColor === color.value ? 'border-accent ring-2 ring-accent/20 scale-110' : 'border-calm-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>

        {/* Title input - Larger on mobile */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="タイトル（任意）"
          className="w-full text-2xl sm:text-3xl font-bold text-calm-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-calm-300 mb-2 sm:mb-4"
        />

        {/* Date display */}
        <p className="text-xs sm:text-sm text-calm-400 mb-4 sm:mb-6">
          {new Date(note.createdAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
          に作成
        </p>

        {/* Editor */}
        <NoteEditor content={content} onChange={handleContentChange} placeholder="メモを入力..." />
      </main>
    </div>
  )
}
