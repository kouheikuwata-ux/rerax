'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { DailyNote } from '@/lib/types'
import { addDailyNote, saveDailyNote, removeDailyNote } from '@/app/actions/daily-notes'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Trash2, ExternalLink } from 'lucide-react'

interface DailyNoteCardProps {
  date: string
  initialNotes: DailyNote[]
}

interface NoteItemProps {
  note: DailyNote
  onDelete: (id: string) => Promise<void>
}

function NoteItem({ note, onDelete }: NoteItemProps) {
  // Get display title (title or first line of content)
  const getDisplayTitle = () => {
    if (note.title) {
      return note.title
    }
    // Strip HTML tags and get first line
    const plainText = note.content.replace(/<[^>]*>/g, '')
    const firstLine = plainText.split('\n')[0]
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...'
    }
    return firstLine || '(空のメモ)'
  }

  // Get first character for badge
  const getFirstChar = () => {
    if (note.title) {
      return note.title.charAt(0)
    }
    const plainText = note.content.replace(/<[^>]*>/g, '')
    return plainText.charAt(0) || '?'
  }

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('このメモを削除しますか？')) {
      await onDelete(note.id)
    }
  }

  return (
    <Link href={`/notes/${note.id}`}>
      <div
        className="flex items-center gap-3 p-3 rounded-lg border border-calm-200 hover:border-accent/50 hover:shadow-sm transition-all cursor-pointer group"
        style={{ backgroundColor: note.color || '#ffffff' }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium">
          {getFirstChar()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-calm-700 truncate group-hover:text-accent transition-colors">
            {getDisplayTitle()}
          </p>
          <p className="text-xs text-calm-400">{formatTime(note.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-calm-300 group-hover:text-accent transition-colors" />
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-red-50 text-calm-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}

export function DailyNoteCard({ date, initialNotes }: DailyNoteCardProps) {
  const [notes, setNotes] = useState<DailyNote[]>(initialNotes)
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const newNoteRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize new note textarea
  useEffect(() => {
    if (isAdding && newNoteRef.current) {
      newNoteRef.current.style.height = 'auto'
      newNoteRef.current.style.height = `${Math.max(80, newNoteRef.current.scrollHeight)}px`
    }
  }, [newContent, isAdding])

  const handleAddNote = async () => {
    if (!newContent.trim()) {
      toast.error('メモの内容を入力してください')
      return
    }

    setIsCreating(true)
    try {
      const newNote = await addDailyNote(date, newContent)
      setNotes([...notes, newNote])
      setNewContent('')
      setIsAdding(false)
      toast.success('メモを追加しました')
    } catch (error) {
      toast.error('メモの追加に失敗しました')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await removeDailyNote(id)
      setNotes(notes.filter((n) => n.id !== id))
      toast.success('メモを削除しました')
    } catch (error) {
      toast.error('メモの削除に失敗しました')
    }
  }

  const startAdding = () => {
    setIsAdding(true)
    setTimeout(() => newNoteRef.current?.focus(), 0)
  }

  const cancelAdding = () => {
    setIsAdding(false)
    setNewContent('')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="muted">
              <FileText className="h-3 w-3 mr-1" />
              メモ
            </Badge>
            <CardTitle>今日のメモ</CardTitle>
            {notes.length > 0 && (
              <span className="text-xs text-calm-400 ml-1">({notes.length})</span>
            )}
          </div>
          {!isAdding && (
            <Button variant="ghost" size="sm" onClick={startAdding}>
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add new note form */}
        {isAdding && (
          <div className="mb-4 p-3 border border-accent/30 rounded-lg bg-accent/5">
            <textarea
              ref={newNoteRef}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="新しいメモを入力..."
              className="w-full min-h-[80px] p-2 rounded border border-calm-200 bg-white
                         focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                         resize-none text-calm-700 text-sm leading-relaxed"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={cancelAdding}>
                キャンセル
              </Button>
              <Button size="sm" onClick={handleAddNote} loading={isCreating}>
                保存
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length === 0 && !isAdding ? (
          <div className="text-center py-6">
            <p className="text-calm-400 text-sm mb-3">メモがありません</p>
            <Button variant="secondary" size="sm" onClick={startAdding}>
              <Plus className="h-4 w-4 mr-1" />
              メモを追加
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteItem key={note.id} note={note} onDelete={handleDeleteNote} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
