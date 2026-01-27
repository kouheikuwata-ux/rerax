import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'local' // Placeholder user

  // Get current date info
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Calculate current week start (Monday)
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diff)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Create yearly vision
  const vision = await prisma.yearlyVision.upsert({
    where: {
      userId_year_area: { userId, year: currentYear, area: 'private' },
    },
    update: {},
    create: {
      userId,
      year: currentYear,
      area: 'private',
      title: '心穏やかに、自分らしく生きる',
      keywords: '健康,学び,つながり,成長',
    },
  })
  console.log(`Created yearly vision for ${currentYear}`)

  // Create yearly goals
  const yearlyGoals = await Promise.all([
    prisma.yearlyGoal.upsert({
      where: {
        id: `goal-${currentYear}-1`,
      },
      update: {},
      create: {
        id: `goal-${currentYear}-1`,
        userId,
        year: currentYear,
        title: '健康的な生活習慣を確立する',
        visionId: vision.id,
        order: 0,
      },
    }),
    prisma.yearlyGoal.upsert({
      where: {
        id: `goal-${currentYear}-2`,
      },
      update: {},
      create: {
        id: `goal-${currentYear}-2`,
        userId,
        year: currentYear,
        title: '新しいスキルを身につける',
        visionId: vision.id,
        order: 1,
      },
    }),
    prisma.yearlyGoal.upsert({
      where: {
        id: `goal-${currentYear}-3`,
      },
      update: {},
      create: {
        id: `goal-${currentYear}-3`,
        userId,
        year: currentYear,
        title: '大切な人との時間を増やす',
        visionId: vision.id,
        order: 2,
      },
    }),
  ])
  console.log(`Created ${yearlyGoals.length} yearly goals`)

  // Create sample month themes (linked to yearly goals)
  const themes = await Promise.all([
    prisma.monthTheme.upsert({
      where: {
        userId_month_area_title: {
          userId,
          month: currentMonth,
          area: 'private',
          title: '朝のルーティンを整える',
        },
      },
      update: {},
      create: {
        userId,
        month: currentMonth,
        title: '朝のルーティンを整える',
        yearlyGoalId: yearlyGoals[0].id,
        order: 0,
      },
    }),
    prisma.monthTheme.upsert({
      where: {
        userId_month_area_title: {
          userId,
          month: currentMonth,
          area: 'private',
          title: 'TypeScriptの基礎を学ぶ',
        },
      },
      update: {},
      create: {
        userId,
        month: currentMonth,
        title: 'TypeScriptの基礎を学ぶ',
        yearlyGoalId: yearlyGoals[1].id,
        order: 1,
      },
    }),
    prisma.monthTheme.upsert({
      where: {
        userId_month_area_title: {
          userId,
          month: currentMonth,
          area: 'private',
          title: '週末に家族と過ごす',
        },
      },
      update: {},
      create: {
        userId,
        month: currentMonth,
        title: '週末に家族と過ごす',
        yearlyGoalId: yearlyGoals[2].id,
        order: 2,
      },
    }),
  ])
  console.log(`Created ${themes.length} month themes for ${currentMonth}`)

  // Create week plan with sample data
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  const weekMap = {
    days: [
      { dayOfWeek: 0, date: weekDates[0], focusTitle: '週の計画を立てる', isRest: false },
      { dayOfWeek: 1, date: weekDates[1], focusTitle: '学習時間を確保', isRest: false },
      { dayOfWeek: 2, date: weekDates[2], focusTitle: undefined, isRest: false },
      { dayOfWeek: 3, date: weekDates[3], focusTitle: '運動する', isRest: false },
      { dayOfWeek: 4, date: weekDates[4], focusTitle: '振り返りをする', isRest: false },
      { dayOfWeek: 5, date: weekDates[5], isRest: true },
      { dayOfWeek: 6, date: weekDates[6], isRest: true },
    ],
    weeklyGoal: '無理せず、穏やかに過ごす',
  }

  await prisma.weekPlan.upsert({
    where: {
      userId_weekStart: { userId, weekStart: weekStartStr },
    },
    update: {
      weekMap: JSON.stringify(weekMap),
    },
    create: {
      userId,
      weekStart: weekStartStr,
      weekMap: JSON.stringify(weekMap),
    },
  })
  console.log(`Created week plan for week starting ${weekStartStr}`)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
