import { prisma } from '@/lib/db'
import { CreateFocusItem, UpdateFocusItem, FocusItem, FocusStatus, Area } from '@/lib/types'
import { getTodayStr } from '@/lib/date-utils'
import { deleteMindMapNodesByEntity } from './mind-map'

export async function getFocusItemsForDate(
  userId: string,
  date: string,
  area?: Area
): Promise<FocusItem[]> {
  const items = await prisma.focusItem.findMany({
    where: {
      userId,
      date,
      ...(area && { area }),
    },
    orderBy: { order: 'asc' },
    include: { theme: true },
  })

  return items.map((item) => ({
    ...item,
    area: item.area as Area,
    duration: item.duration as 5 | 10 | 30 | 60,
    load: item.load as 1 | 2 | 3 | 4 | 5,
    status: item.status as FocusStatus,
  }))
}

export async function getTodayFocusItems(userId: string, area?: Area): Promise<FocusItem[]> {
  return getFocusItemsForDate(userId, getTodayStr(), area)
}

export async function getRecentFocusItems(
  userId: string,
  days: number = 7,
  area?: Area
): Promise<FocusItem[]> {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - days)

  const items = await prisma.focusItem.findMany({
    where: {
      userId,
      date: {
        gte: startDate.toISOString().split('T')[0],
        lte: today.toISOString().split('T')[0],
      },
      ...(area && { area }),
    },
    orderBy: [{ date: 'desc' }, { order: 'asc' }],
  })

  return items.map((item) => ({
    ...item,
    area: item.area as Area,
    duration: item.duration as 5 | 10 | 30 | 60,
    load: item.load as 1 | 2 | 3 | 4 | 5,
    status: item.status as FocusStatus,
  }))
}

export async function createFocusItem(
  userId: string,
  data: CreateFocusItem
): Promise<FocusItem> {
  // Get current max order for the date and area
  const maxOrder = await prisma.focusItem.aggregate({
    where: { userId, date: data.date, area: data.area },
    _max: { order: true },
  })

  const item = await prisma.focusItem.create({
    data: {
      userId,
      date: data.date,
      area: data.area ?? 'private',
      title: data.title,
      duration: data.duration ?? 30,
      load: data.load ?? 3,
      deadlineDate: data.deadlineDate ?? null,
      themeId: data.themeId ?? null,
      intention: data.intention ?? null,
      status: 'planned',
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return {
    ...item,
    area: item.area as Area,
    duration: item.duration as 5 | 10 | 30 | 60,
    load: item.load as 1 | 2 | 3 | 4 | 5,
    status: item.status as FocusStatus,
  }
}

export async function updateFocusItem(
  userId: string,
  itemId: string,
  data: UpdateFocusItem
): Promise<FocusItem> {
  const item = await prisma.focusItem.update({
    where: { id: itemId, userId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.load !== undefined && { load: data.load }),
      ...(data.deadlineDate !== undefined && { deadlineDate: data.deadlineDate }),
      ...(data.themeId !== undefined && { themeId: data.themeId }),
      ...(data.intention !== undefined && { intention: data.intention }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.order !== undefined && { order: data.order }),
    },
  })

  return {
    ...item,
    area: item.area as Area,
    duration: item.duration as 5 | 10 | 30 | 60,
    load: item.load as 1 | 2 | 3 | 4 | 5,
    status: item.status as FocusStatus,
  }
}

export async function deleteFocusItem(
  userId: string,
  itemId: string
): Promise<void> {
  // Delete associated mind map nodes first
  await deleteMindMapNodesByEntity('focus', itemId)

  await prisma.focusItem.delete({
    where: { id: itemId, userId },
  })
}

export async function markFocusItemDone(
  userId: string,
  itemId: string
): Promise<FocusItem> {
  return updateFocusItem(userId, itemId, { status: 'done' })
}

export async function markFocusItemSkipped(
  userId: string,
  itemId: string
): Promise<FocusItem> {
  return updateFocusItem(userId, itemId, { status: 'skipped' })
}
