import { prisma } from '@/lib/db'
import { CreateYearlyVision, CreateYearlyGoal, YearlyVision, YearlyGoal, Area } from '@/lib/types'

// ============================================
// Yearly Vision
// ============================================

export async function getYearlyVision(
  userId: string,
  year: number,
  area: Area
): Promise<YearlyVision | null> {
  const vision = await prisma.yearlyVision.findUnique({
    where: {
      userId_year_area: { userId, year, area },
    },
  })

  if (!vision) return null

  return {
    ...vision,
    area: vision.area as Area,
  }
}

export async function getCurrentYearVision(userId: string, area: Area): Promise<YearlyVision | null> {
  const currentYear = new Date().getFullYear()
  return getYearlyVision(userId, currentYear, area)
}

export async function createYearlyVision(
  userId: string,
  data: CreateYearlyVision
): Promise<YearlyVision> {
  const vision = await prisma.yearlyVision.create({
    data: {
      userId,
      year: data.year,
      area: data.area,
      title: data.title,
      keywords: data.keywords ?? null,
    },
  })

  return {
    ...vision,
    area: vision.area as Area,
  }
}

export async function updateYearlyVision(
  userId: string,
  year: number,
  area: Area,
  title: string,
  keywords?: string
): Promise<YearlyVision> {
  const vision = await prisma.yearlyVision.upsert({
    where: {
      userId_year_area: { userId, year, area },
    },
    update: {
      title,
      keywords: keywords ?? null,
    },
    create: {
      userId,
      year,
      area,
      title,
      keywords: keywords ?? null,
    },
  })

  return {
    ...vision,
    area: vision.area as Area,
  }
}

// ============================================
// Yearly Goals
// ============================================

export async function getYearlyGoals(
  userId: string,
  year: number,
  area: Area
): Promise<YearlyGoal[]> {
  const goals = await prisma.yearlyGoal.findMany({
    where: { userId, year, area },
    orderBy: { order: 'asc' },
  })

  return goals.map(g => ({
    ...g,
    area: g.area as Area,
    visionId: g.visionId ?? null,
  }))
}

export async function getCurrentYearGoals(userId: string, area: Area): Promise<YearlyGoal[]> {
  const currentYear = new Date().getFullYear()
  return getYearlyGoals(userId, currentYear, area)
}

export async function createYearlyGoal(
  userId: string,
  data: CreateYearlyGoal
): Promise<YearlyGoal> {
  // Get current max order for the year and area
  const maxOrder = await prisma.yearlyGoal.aggregate({
    where: { userId, year: data.year, area: data.area },
    _max: { order: true },
  })

  const goal = await prisma.yearlyGoal.create({
    data: {
      userId,
      year: data.year,
      area: data.area,
      title: data.title,
      visionId: data.visionId ?? null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return {
    ...goal,
    area: goal.area as Area,
    visionId: goal.visionId ?? null,
  }
}

export async function updateYearlyGoal(
  userId: string,
  goalId: string,
  title: string
): Promise<YearlyGoal> {
  const goal = await prisma.yearlyGoal.update({
    where: { id: goalId, userId },
    data: { title },
  })

  return {
    ...goal,
    area: goal.area as Area,
    visionId: goal.visionId ?? null,
  }
}

export async function deleteYearlyGoal(
  userId: string,
  goalId: string
): Promise<void> {
  await prisma.yearlyGoal.delete({
    where: { id: goalId, userId },
  })
}

// ============================================
// Combined data for hierarchy view
// ============================================

export interface YearlyPlanData {
  vision: YearlyVision | null
  goals: YearlyGoal[]
}

export async function getYearlyPlanData(
  userId: string,
  year: number,
  area: Area
): Promise<YearlyPlanData> {
  const [vision, goals] = await Promise.all([
    getYearlyVision(userId, year, area),
    getYearlyGoals(userId, year, area),
  ])

  return { vision, goals }
}

export async function getCurrentYearPlanData(userId: string, area: Area): Promise<YearlyPlanData> {
  const currentYear = new Date().getFullYear()
  return getYearlyPlanData(userId, currentYear, area)
}
