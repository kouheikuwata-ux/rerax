import { google, calendar_v3 } from 'googleapis'
import { prisma } from '@/lib/db'

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: Date
  end: Date
  allDay: boolean
  calendarId: string
  calendarName: string
}

// カレンダー名から仕事/プライベートを判定
function determineAreaFromCalendarName(calendarName: string): 'work' | 'private' {
  const workKeywords = ['仕事', 'work', 'Work', 'WORK', '業務', '会社', 'office', 'Office', 'job', 'Job']
  const lowerName = calendarName.toLowerCase()

  for (const keyword of workKeywords) {
    if (calendarName.includes(keyword) || lowerName.includes(keyword.toLowerCase())) {
      return 'work'
    }
  }

  return 'private'
}

async function refreshAccessToken(accountId: string, refreshToken: string): Promise<string | null> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({ refresh_token: refreshToken })

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()

    // 新しいトークンをDBに保存
    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date
          ? Math.floor(credentials.expiry_date / 1000)
          : null,
      },
    })

    return credentials.access_token ?? null
  } catch (error) {
    console.error('Failed to refresh access token:', error)
    return null
  }
}

export async function getGoogleCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<GoogleCalendarEvent[]> {
  // アカウントからトークン取得
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  })

  if (!account) {
    console.log('No Google account found for user')
    return []
  }

  let accessToken = account.access_token

  // トークンの有効期限をチェック
  if (account.expires_at && account.expires_at * 1000 < Date.now()) {
    if (account.refresh_token) {
      accessToken = await refreshAccessToken(account.id, account.refresh_token)
    }
    if (!accessToken) {
      console.log('Failed to get valid access token')
      return []
    }
  }

  if (!accessToken) {
    console.log('No access token available')
    return []
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    // 全カレンダーリストを取得
    const calendarListResponse = await calendar.calendarList.list()
    const calendars = calendarListResponse.data.items || []

    const allEvents: GoogleCalendarEvent[] = []

    // 各カレンダーからイベントを取得
    for (const cal of calendars) {
      if (!cal.id) continue

      try {
        const response = await calendar.events.list({
          calendarId: cal.id,
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 250,
        })

        const items = response.data.items || []

        const events = items.map((event: calendar_v3.Schema$Event) => {
          const startDateTime = event.start?.dateTime || event.start?.date
          const endDateTime = event.end?.dateTime || event.end?.date
          const allDay = !event.start?.dateTime

          return {
            id: event.id || '',
            summary: event.summary || '(タイトルなし)',
            description: event.description || undefined,
            start: new Date(startDateTime || new Date()),
            end: new Date(endDateTime || new Date()),
            allDay,
            calendarId: cal.id || '',
            calendarName: cal.summary || 'Unknown',
          }
        })

        allEvents.push(...events)
      } catch (calError) {
        // 個別のカレンダー取得エラーは無視して続行
        console.warn(`Failed to fetch events from calendar ${cal.summary}:`, calError)
      }
    }

    return allEvents
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error)
    return []
  }
}

export function formatGoogleEventToFocusItem(event: GoogleCalendarEvent) {
  // 日付をYYYY-MM-DD形式に変換
  const date = event.start.toISOString().split('T')[0]

  // 所要時間を計算（分単位）
  const durationMs = event.end.getTime() - event.start.getTime()
  const durationMinutes = Math.round(durationMs / (1000 * 60))

  // カレンダー名から仕事/プライベートを判定
  const area = determineAreaFromCalendarName(event.calendarName)

  return {
    date,
    title: event.summary,
    duration: event.allDay ? 60 : Math.min(durationMinutes, 480), // 最大8時間
    googleEventId: event.id,
    area,
    load: 3,
    status: 'planned' as const,
  }
}
