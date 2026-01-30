'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { DailyNote } from '@/lib/types'
import { addDailyNote, removeDailyNote } from '@/app/actions/daily-notes'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Trash2, ChevronRight } from 'lucide-react'

interface DailyNoteCardProps {
  date: string
  initialNotes: DailyNote[]
}

interface NoteItemProps {
  note: DailyNote
  onDelete: (id: string) => Promise<void>
}

function NoteItem({ note, onDelete }: NoteItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Get display title (title or first line of content)
  const getDisplayTitle = () => {
    if (note.title) {
      return note.title
    }
    // Strip HTML tags and get first line
    const plainText = note.content.replace(/<[^>]*>/g, '')
    const firstLine = plainText.split('\n')[0]
    if (firstLine.length > 30) {
      return firstLine.substring(0, 30) + '...'
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

  const handleDelete = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('このメモを削除しますか？')) {
      setIsDeleting(true)
      try {
        await onDelete(note.id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div
      className="flex items-center gap-2 p-3 rounded-lg border border-calm-200 active:bg-calm-50 transition-all"
      style={{ backgroundColor: note.color || '#ffffff' }}
    >
      {/* Main content - links to editor */}
      <Link href={`/notes/${note.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium text-lg">
          {getFirstChar()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-calm-700 truncate">
            {getDisplayTitle()}
          </p>
          <p className="text-xs text-calm-400">{formatTime(note.createdAt)}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-calm-300 flex-shrink-0" />
      </Link>

      {/* Delete button - always visible on mobile */}
      <button
        onClick={handleDelete}
        onTouchEnd={handleDelete}
        disabled={isDeleting}
        className="p-2 rounded-lg bg-calm-100 hover:bg-red-50 active:bg-red-100 text-calm-400 hover:text-red-500 active:text-red-600 transition-colors flex-shrink-0 touch-manipulation"
        aria-label="削除"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

export function DailyNoteCard({ date, initialNotes }: DailyNoteCardProps) {
  const router = useRouter()
  const [notes, setNotes] = useState<DailyNote[]>(initialNotes)
  const [isCreating, setIsCreating] = useState(false)

  // Create new note and navigate to editor
  const handleCreateNote = async () => {
    setIsCreating(true)
    try {
      const newNote = await addDailyNote(date, '')
      // Navigate to editor page immediately
      router.push(`/notes/${newNote.id}`)
    } catch (error) {
      toast.error('メモの作成に失敗しました')
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateNote}
            loading={isCreating}
            className="touch-manipulation"
          >
            <Plus className="h-4 w-4 mr-1" />
            追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-calm-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-calm-300" />
            </div>
            <p className="text-calm-400 text-sm mb-4">メモがありません</p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateNote}
              loading={isCreating}
              className="touch-manipulation"
            >
              <Plus className="h-5 w-5 mr-2" />
              新しいメモを作成
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
