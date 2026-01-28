'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUserId, isAuthenticated } from '@/lib/auth'
import { getGoogleCalendarEvents, formatGoogleEventToFocusItem } from '@/lib/google-calendar'

export async function syncGoogleCalendar(startDate: string, endDate: string) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return { success: false, error: 'ログインが必要です', synced: 0 }
  }

  const userId = await getCurrentUserId()

  try {
    const events = await getGoogleCalendarEvents(
      userId,
      new Date(startDate),
      new Date(endDate)
    )

    if (events.length === 0) {
      return { success: true, synced: 0, message: '同期する予定がありません' }
    }

    let syncedCount = 0

    for (const event of events) {
      // 既存のイベントをgoogleEventIdでチェック
      const existingItem = await prisma.focusItem.findFirst({
        where: {
          userId,
          googleEventId: event.id,
        },
      })

      if (existingItem) {
        // 既存のイベントを更新（エリアも含む）
        const focusItemData = formatGoogleEventToFocusItem(event)
        await prisma.focusItem.update({
          where: { id: existingItem.id },
          data: {
            title: event.summary,
            date: event.start.toISOString().split('T')[0],
            area: focusItemData.area,
          },
        })
      } else {
        // 新規作成
        const focusItemData = formatGoogleEventToFocusItem(event)
        await prisma.focusItem.create({
          data: {
            ...focusItemData,
            userId,
          },
        })
        syncedCount++
      }
    }

    revalidatePath('/calendar')
    revalidatePath('/')
    return { success: true, synced: syncedCount }
  } catch (error) {
    console.error('Google Calendar sync error:', error)
    return { success: false, error: '同期に失敗しました', synced: 0 }
  }
}

export async function getGoogleConnectionStatus() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return { connected: false, calendarConnected: false, email: null }
  }

  const userId = await getCurrentUserId()

  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
    include: { user: true },
  })

  if (!account) {
    return { connected: false, calendarConnected: false, email: null }
  }

  // カレンダースコープが含まれているか確認
  const calendarScope = 'https://www.googleapis.com/auth/calendar.readonly'
  const hasCalendarScope = account.scope?.includes(calendarScope) ?? false

  return {
    connected: true,
    calendarConnected: hasCalendarScope,
    email: account.user.email,
  }
}
