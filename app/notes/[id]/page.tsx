'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { DailyNote } from '@/lib/types'
import { getDailyNoteById, saveDailyNote, removeDailyNote } from '@/app/actions/daily-notes'
import { NoteEditor } from '@/components/daily-note/note-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Check } from 'lucide-react'

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
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!note) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cardColor }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-calm-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Button>
            </Link>
            <div className="text-sm text-calm-500">
              {isSaving ? (
                '保存中...'
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
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            削除
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Card Color Picker */}
        <div className="mb-6">
          <label className="text-sm text-calm-500 block mb-2">カードの色</label>
          <div className="flex gap-2">
            {CARD_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  cardColor === color.value ? 'border-accent ring-2 ring-accent/20' : 'border-calm-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="タイトル（任意）"
          className="w-full text-3xl font-bold text-calm-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-calm-300 mb-4"
        />

        {/* Date display */}
        <p className="text-sm text-calm-400 mb-6">
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
