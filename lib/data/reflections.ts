import { prisma } from '@/lib/db'
import { CreateReflectionLog, ReflectionLog, ReflectionResult, ReasonCode } from '@/lib/types'

export async function getReflectionLog(
  userId: string,
  date: string
): Promise<ReflectionLog | null> {
  const log = await prisma.reflectionLog.findUnique({
    where: {
      userId_date: { userId, date },
    },
  })

  if (!log) return null

  return {
    ...log,
    result: log.result as ReflectionResult,
    reasonCode: log.reasonCode as ReasonCode | null,
  }
}

export async function getRecentReflections(
  userId: string,
  days: number = 3
): Promise<ReflectionLog[]> {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - days)

  const logs = await prisma.reflectionLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate.toISOString().split('T')[0],
        lte: today.toISOString().split('T')[0],
      },
    },
    orderBy: { date: 'desc' },
  })

  return logs.map((log) => ({
    ...log,
    result: log.result as ReflectionResult,
    reasonCode: log.reasonCode as ReasonCode | null,
  }))
}

export async function createReflectionLog(
  userId: string,
  data: CreateReflectionLog
): Promise<ReflectionLog> {
  const log = await prisma.reflectionLog.upsert({
    where: {
      userId_date: { userId, date: data.date },
    },
    update: {
      result: data.result,
      reasonCode: data.reasonCode ?? null,
      note: data.note ?? null,
    },
    create: {
      userId,
      date: data.date,
      result: data.result,
      reasonCode: data.reasonCode ?? null,
      note: data.note ?? null,
    },
  })

  return {
    ...log,
    result: log.result as ReflectionResult,
    reasonCode: log.reasonCode as ReasonCode | null,
  }
}
