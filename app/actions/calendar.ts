'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { FocusItem, Area, FocusItemSchema } from '@/lib/types'

export async function getCalendarData(
  startDate: string,
  endDate: string,
  area: Area
): Promise<FocusItem[]> {
  const userId = await requireAuth()

  const items = await prisma.focusItem.findMany({
    where: {
      userId,
      area,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: [
      { date: 'asc' },
      { order: 'asc' },
    ],
  })

  return items.map((item) => FocusItemSchema.parse(item))
}

export async function addCalendarFocusItem(data: {
  date: string
  area: Area
  title: string
}): Promise<FocusItem> {
  const userId = await requireAuth()

  // Get the max order for this date
  const maxOrder = await prisma.focusItem.aggregate({
    where: {
      userId,
      date: data.date,
      area: data.area,
    },
    _max: {
      order: true,
    },
  })

  const item = await prisma.focusItem.create({
    data: {
      userId,
      date: data.date,
      area: data.area,
      title: data.title,
      order: (maxOrder._max.order ?? -1) + 1,
      duration: 30,
      load: 3,
      status: 'planned',
    },
  })

  revalidatePath('/calendar')
  revalidatePath('/')

  return FocusItemSchema.parse(item)
}
