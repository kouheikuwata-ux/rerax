'use server'

import { requireAuth } from '@/lib/auth'
import {
  getDailyNotes as getNotes,
  getDailyNoteById as getNoteById,
  createDailyNote as createNote,
  updateDailyNote as updateNote,
  deleteDailyNote as deleteNote,
} from '@/lib/data/daily-notes'
import { DailyNote } from '@/lib/types'

export async function getDailyNotes(date: string): Promise<DailyNote[]> {
  const userId = await requireAuth()
  return getNotes(userId, date)
}

export async function getDailyNoteById(noteId: string): Promise<DailyNote | null> {
  const userId = await requireAuth()
  return getNoteById(userId, noteId)
}

export async function addDailyNote(date: string, content: string): Promise<DailyNote> {
  const userId = await requireAuth()
  return createNote(userId, date, content)
}

export async function saveDailyNote(
  noteId: string,
  data: { content?: string; title?: string | null; color?: string | null }
): Promise<DailyNote> {
  const userId = await requireAuth()
  return updateNote(userId, noteId, data)
}

export async function removeDailyNote(noteId: string): Promise<void> {
  const userId = await requireAuth()
  await deleteNote(userId, noteId)
}
