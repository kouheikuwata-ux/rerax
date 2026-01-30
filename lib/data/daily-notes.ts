import { prisma } from '@/lib/db'
import { DailyNote } from '@/lib/types'

export async function getDailyNotes(
  userId: string,
  date: string,
  organizationId: string | null = null
): Promise<DailyNote[]> {
  const notes = await prisma.dailyNote.findMany({
    where: {
      userId,
      date,
      organizationId,
    },
    orderBy: { order: 'asc' },
  })

  return notes as DailyNote[]
}

export async function createDailyNote(
  userId: string,
  date: string,
  content: string,
  organizationId: string | null = null
): Promise<DailyNote> {
  // Get max order for this date
  const maxOrder = await prisma.dailyNote.aggregate({
    where: { userId, date, organizationId },
    _max: { order: true },
  })

  const note = await prisma.dailyNote.create({
    data: {
      userId,
      date,
      content,
      organizationId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return note as DailyNote
}

export async function getDailyNoteById(
  userId: string,
  noteId: string
): Promise<DailyNote | null> {
  const note = await prisma.dailyNote.findFirst({
    where: { id: noteId, userId },
  })
  return note as DailyNote | null
}

export async function updateDailyNote(
  userId: string,
  noteId: string,
  data: { content?: string; title?: string | null; color?: string | null }
): Promise<DailyNote> {
  const note = await prisma.dailyNote.update({
    where: { id: noteId, userId },
    data,
  })

  return note as DailyNote
}

export async function deleteDailyNote(
  userId: string,
  noteId: string
): Promise<void> {
  await prisma.dailyNote.delete({
    where: { id: noteId, userId },
  })
}
