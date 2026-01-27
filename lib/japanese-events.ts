// 日本のイベント・祝日データ

export type EventCategory =
  | 'holiday'      // 祝日
  | 'seasonal'     // 季節のイベント
  | 'cultural'     // 文化・伝統行事
  | 'commercial'   // 商業イベント
  | 'sports'       // スポーツ
  | 'other'        // その他

export interface JapaneseEvent {
  name: string
  month: number
  day: number | null  // null = 変動日
  weekOfMonth?: number  // 第n週
  dayOfWeek?: number   // 0=日曜, 1=月曜...
  category: EventCategory
  description?: string
}

export const EVENT_CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; label: string }> = {
  holiday: { bg: 'bg-red-100', text: 'text-red-700', label: '祝日' },
  seasonal: { bg: 'bg-green-100', text: 'text-green-700', label: '季節' },
  cultural: { bg: 'bg-purple-100', text: 'text-purple-700', label: '伝統行事' },
  commercial: { bg: 'bg-pink-100', text: 'text-pink-700', label: '商業' },
  sports: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'スポーツ' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'その他' },
}

// 固定日のイベント
export const FIXED_EVENTS: JapaneseEvent[] = [
  // 1月
  { name: '元日', month: 1, day: 1, category: 'holiday' },
  { name: '初詣', month: 1, day: 1, category: 'cultural', description: '神社・寺院への参拝' },
  { name: '七草', month: 1, day: 7, category: 'cultural', description: '七草粥を食べる日' },
  { name: '鏡開き', month: 1, day: 11, category: 'cultural' },
  { name: '小正月', month: 1, day: 15, category: 'cultural' },

  // 2月
  { name: '節分', month: 2, day: 3, category: 'cultural', description: '豆まき' },
  { name: '立春', month: 2, day: 4, category: 'seasonal' },
  { name: '建国記念の日', month: 2, day: 11, category: 'holiday' },
  { name: 'バレンタインデー', month: 2, day: 14, category: 'commercial' },
  { name: '天皇誕生日', month: 2, day: 23, category: 'holiday' },

  // 3月
  { name: 'ひな祭り', month: 3, day: 3, category: 'cultural', description: '桃の節句' },
  { name: 'ホワイトデー', month: 3, day: 14, category: 'commercial' },
  { name: '春分の日', month: 3, day: 20, category: 'holiday' }, // 実際は年により異なる
  { name: '卒業シーズン', month: 3, day: 15, category: 'other', description: '多くの学校で卒業式' },

  // 4月
  { name: 'エイプリルフール', month: 4, day: 1, category: 'other' },
  { name: '入学式シーズン', month: 4, day: 6, category: 'other', description: '新学期開始' },
  { name: '花まつり', month: 4, day: 8, category: 'cultural', description: '釈迦の誕生日' },
  { name: '昭和の日', month: 4, day: 29, category: 'holiday' },

  // 5月
  { name: '八十八夜', month: 5, day: 2, category: 'seasonal', description: '新茶の季節' },
  { name: '憲法記念日', month: 5, day: 3, category: 'holiday' },
  { name: 'みどりの日', month: 5, day: 4, category: 'holiday' },
  { name: 'こどもの日', month: 5, day: 5, category: 'holiday', description: '端午の節句' },
  { name: '母の日', month: 5, day: null, weekOfMonth: 2, dayOfWeek: 0, category: 'commercial' },

  // 6月
  { name: '衣替え', month: 6, day: 1, category: 'seasonal' },
  { name: '梅雨入り', month: 6, day: 10, category: 'seasonal', description: '地域により異なる' },
  { name: '父の日', month: 6, day: null, weekOfMonth: 3, dayOfWeek: 0, category: 'commercial' },
  { name: '夏至', month: 6, day: 21, category: 'seasonal' },

  // 7月
  { name: '海の日', month: 7, day: null, weekOfMonth: 3, dayOfWeek: 1, category: 'holiday' },
  { name: '七夕', month: 7, day: 7, category: 'cultural' },
  { name: '土用の丑の日', month: 7, day: 20, category: 'cultural', description: 'うなぎを食べる日' },
  { name: '夏休み開始', month: 7, day: 20, category: 'other' },

  // 8月
  { name: '花火大会シーズン', month: 8, day: 1, category: 'cultural' },
  { name: '山の日', month: 8, day: 11, category: 'holiday' },
  { name: 'お盆', month: 8, day: 13, category: 'cultural', description: '先祖供養' },
  { name: '終戦記念日', month: 8, day: 15, category: 'other' },
  { name: '地蔵盆', month: 8, day: 24, category: 'cultural' },

  // 9月
  { name: '防災の日', month: 9, day: 1, category: 'other' },
  { name: '敬老の日', month: 9, day: null, weekOfMonth: 3, dayOfWeek: 1, category: 'holiday' },
  { name: '秋分の日', month: 9, day: 23, category: 'holiday' }, // 実際は年により異なる
  { name: 'お彼岸', month: 9, day: 20, category: 'cultural' },

  // 10月
  { name: '衣替え', month: 10, day: 1, category: 'seasonal' },
  { name: 'スポーツの日', month: 10, day: null, weekOfMonth: 2, dayOfWeek: 1, category: 'holiday' },
  { name: '体育祭シーズン', month: 10, day: 10, category: 'sports' },
  { name: 'ハロウィン', month: 10, day: 31, category: 'commercial' },

  // 11月
  { name: '文化の日', month: 11, day: 3, category: 'holiday' },
  { name: '七五三', month: 11, day: 15, category: 'cultural' },
  { name: '勤労感謝の日', month: 11, day: 23, category: 'holiday' },
  { name: 'ブラックフライデー', month: 11, day: null, weekOfMonth: 4, dayOfWeek: 5, category: 'commercial' },
  { name: '紅葉シーズン', month: 11, day: 10, category: 'seasonal' },

  // 12月
  { name: '冬至', month: 12, day: 22, category: 'seasonal' },
  { name: 'クリスマスイブ', month: 12, day: 24, category: 'commercial' },
  { name: 'クリスマス', month: 12, day: 25, category: 'commercial' },
  { name: '大晦日', month: 12, day: 31, category: 'cultural', description: '年越しそば' },
  { name: '年末年始休暇', month: 12, day: 28, category: 'other' },
]

// 第n週のm曜日を計算
function getNthDayOfWeek(year: number, month: number, weekOfMonth: number, dayOfWeek: number): number {
  const firstDay = new Date(year, month - 1, 1)
  const firstDayOfWeek = firstDay.getDay()

  let day = 1 + (dayOfWeek - firstDayOfWeek + 7) % 7
  day += (weekOfMonth - 1) * 7

  return day
}

// 指定した年月のイベントを取得
export function getEventsForMonth(year: number, month: number): Array<{ date: Date; event: JapaneseEvent }> {
  const events: Array<{ date: Date; event: JapaneseEvent }> = []

  for (const event of FIXED_EVENTS) {
    if (event.month === month) {
      let day: number

      if (event.day !== null) {
        day = event.day
      } else if (event.weekOfMonth !== undefined && event.dayOfWeek !== undefined) {
        day = getNthDayOfWeek(year, month, event.weekOfMonth, event.dayOfWeek)
      } else {
        continue
      }

      // 日付が有効かチェック
      const date = new Date(year, month - 1, day)
      if (date.getMonth() === month - 1) {
        events.push({ date, event })
      }
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

// 指定した日のイベントを取得
export function getEventsForDate(year: number, month: number, day: number): JapaneseEvent[] {
  const monthEvents = getEventsForMonth(year, month)
  return monthEvents
    .filter(e => e.date.getDate() === day)
    .map(e => e.event)
}
