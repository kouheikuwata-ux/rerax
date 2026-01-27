import { prisma } from '@/lib/db'
import { CreateMonthTheme, MonthTheme, Area } from '@/lib/types'
import { getCurrentMonthStr } from '@/lib/date-utils'

export async function getMonthThemes(
  userId: string,
  month: string,
  area: Area
): Promise<MonthTheme[]> {
  const themes = await prisma.monthTheme.findMany({
    where: { userId, month, area },
    orderBy: { order: 'asc' },
  })

  return themes.map(t => ({
    ...t,
    area: t.area as Area,
    yearlyGoalId: t.yearlyGoalId ?? null,
  }))
}

export async function getCurrentMonthThemes(userId: string, area: Area): Promise<MonthTheme[]> {
  return getMonthThemes(userId, getCurrentMonthStr(), area)
}

export async function createMonthTheme(
  userId: string,
  data: CreateMonthTheme
): Promise<MonthTheme> {
  // Get current max order for the month and area
  const maxOrder = await prisma.monthTheme.aggregate({
    where: { userId, month: data.month, area: data.area },
    _max: { order: true },
  })

  const theme = await prisma.monthTheme.create({
    data: {
      userId,
      month: data.month,
      area: data.area,
      title: data.title,
      yearlyGoalId: data.yearlyGoalId ?? null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return {
    ...theme,
    area: theme.area as Area,
    yearlyGoalId: theme.yearlyGoalId ?? null,
  }
}

export async function updateMonthTheme(
  userId: string,
  themeId: string,
  title: string
): Promise<MonthTheme> {
  const theme = await prisma.monthTheme.update({
    where: { id: themeId, userId },
    data: { title },
  })

  return {
    ...theme,
    area: theme.area as Area,
    yearlyGoalId: theme.yearlyGoalId ?? null,
  }
}

export async function deleteMonthTheme(
  userId: string,
  themeId: string
): Promise<void> {
  await prisma.monthTheme.delete({
    where: { id: themeId, userId },
  })
}

export async function reorderMonthThemes(
  userId: string,
  month: string,
  area: Area,
  themeIds: string[]
): Promise<void> {
  await prisma.$transaction(
    themeIds.map((id, index) =>
      prisma.monthTheme.update({
        where: { id, userId },
        data: { order: index },
      })
    )
  )
}
