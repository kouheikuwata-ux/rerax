// 日本のイベント・祝日データ

export type EventCategory =
  | 'holiday'      // 祝日
  | 'seasonal'     // 季節のイベント
  | 'cultural'     // 文化・伝統行事
  | 'commercial'   // 商業イベント
  | 'sports'       // スポーツ
  | 'food'         // 食・グルメ
  | 'school'       // 学校行事
  | 'business'     // ビジネス・経済
  | 'astronomy'    // 天文・宇宙
  | 'health'       // 健康・美容
  | 'travel'       // 旅行・観光
  | 'entertainment' // エンタメ・芸能
  | 'anniversary'  // 記念日
  | 'spiritual'    // 宗教・スピリチュアル
  | 'family'       // 子育て・家族
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
  food: { bg: 'bg-orange-100', text: 'text-orange-700', label: '食・グルメ' },
  school: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '学校行事' },
  business: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'ビジネス' },
  astronomy: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '天文' },
  health: { bg: 'bg-teal-100', text: 'text-teal-700', label: '健康' },
  travel: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: '旅行' },
  entertainment: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', label: 'エンタメ' },
  anniversary: { bg: 'bg-rose-100', text: 'text-rose-700', label: '記念日' },
  spiritual: { bg: 'bg-amber-100', text: 'text-amber-700', label: '宗教' },
  family: { bg: 'bg-lime-100', text: 'text-lime-700', label: '家族' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'その他' },
}

// 固定日のイベント
export const FIXED_EVENTS: JapaneseEvent[] = [
  // ========================================
  // 1月
  // ========================================
  // 祝日
  { name: '元日', month: 1, day: 1, category: 'holiday' },
  { name: '成人の日', month: 1, day: null, weekOfMonth: 2, dayOfWeek: 1, category: 'holiday' },
  // 伝統行事
  { name: '初詣', month: 1, day: 1, category: 'spiritual', description: '神社・寺院への参拝' },
  { name: '七草', month: 1, day: 7, category: 'food', description: '七草粥を食べる日' },
  { name: '鏡開き', month: 1, day: 11, category: 'cultural' },
  { name: '小正月', month: 1, day: 15, category: 'cultural' },
  { name: '大寒', month: 1, day: 20, category: 'seasonal' },
  // 家族
  { name: '成人式', month: 1, day: null, weekOfMonth: 2, dayOfWeek: 1, category: 'family', description: '20歳の祝い' },
  // 天文
  { name: 'しぶんぎ座流星群', month: 1, day: 4, category: 'astronomy', description: '三大流星群の一つ' },
  // 記念日
  { name: 'いちごの日', month: 1, day: 15, category: 'anniversary', description: '1(いち)5(ご)の語呂合わせ' },

  // ========================================
  // 2月
  // ========================================
  // 祝日
  { name: '建国記念の日', month: 2, day: 11, category: 'holiday' },
  { name: '天皇誕生日', month: 2, day: 23, category: 'holiday' },
  // 伝統行事・宗教
  { name: '節分', month: 2, day: 3, category: 'spiritual', description: '豆まき・恵方巻' },
  { name: '立春', month: 2, day: 4, category: 'seasonal' },
  // 商業
  { name: 'バレンタインデー', month: 2, day: 14, category: 'commercial' },
  // 食
  { name: '恵方巻の日', month: 2, day: 3, category: 'food', description: '恵方を向いて食べる' },
  // 健康
  { name: '花粉シーズン開始', month: 2, day: 15, category: 'health', description: 'スギ花粉飛散開始' },
  // 記念日
  { name: '猫の日', month: 2, day: 22, category: 'anniversary', description: 'ニャン(2)ニャン(2)ニャン(2)' },
  { name: 'ふたりの日', month: 2, day: 2, category: 'anniversary' },

  // ========================================
  // 3月
  // ========================================
  // 祝日
  { name: '春分の日', month: 3, day: 20, category: 'holiday' },
  // 伝統行事
  { name: 'ひな祭り', month: 3, day: 3, category: 'cultural', description: '桃の節句' },
  { name: 'お彼岸(春)', month: 3, day: 18, category: 'spiritual', description: '先祖供養' },
  // 商業
  { name: 'ホワイトデー', month: 3, day: 14, category: 'commercial' },
  // 学校
  { name: '卒業式シーズン', month: 3, day: 15, category: 'school', description: '多くの学校で卒業式' },
  { name: '春休み開始', month: 3, day: 25, category: 'school' },
  // 旅行
  { name: '桜開花(東京)', month: 3, day: 24, category: 'travel', description: '平年の開花日' },
  // ビジネス
  { name: '決算期末', month: 3, day: 31, category: 'business', description: '多くの企業の決算' },
  // 記念日
  { name: 'サンキューの日', month: 3, day: 9, category: 'anniversary', description: '3(サン)9(キュー)' },

  // ========================================
  // 4月
  // ========================================
  // 祝日
  { name: '昭和の日', month: 4, day: 29, category: 'holiday' },
  // 学校
  { name: '入学式シーズン', month: 4, day: 6, category: 'school', description: '新学期開始' },
  { name: '入園式', month: 4, day: 10, category: 'family', description: '幼稚園・保育園' },
  // 伝統行事
  { name: '花まつり', month: 4, day: 8, category: 'spiritual', description: '釈迦の誕生日' },
  // 旅行
  { name: '桜満開(東京)', month: 4, day: 2, category: 'travel', description: '平年の満開日' },
  // ビジネス
  { name: '新入社員研修', month: 4, day: 1, category: 'business', description: '新年度開始' },
  // その他
  { name: 'エイプリルフール', month: 4, day: 1, category: 'other' },
  // 記念日
  { name: 'よい夫婦の日', month: 4, day: 22, category: 'anniversary', description: '4(よい)22(ふうふ)' },
  // 天文
  { name: 'こと座流星群', month: 4, day: 22, category: 'astronomy' },

  // ========================================
  // 5月
  // ========================================
  // 祝日
  { name: '憲法記念日', month: 5, day: 3, category: 'holiday' },
  { name: 'みどりの日', month: 5, day: 4, category: 'holiday' },
  { name: 'こどもの日', month: 5, day: 5, category: 'holiday', description: '端午の節句' },
  // 商業・家族
  { name: '母の日', month: 5, day: null, weekOfMonth: 2, dayOfWeek: 0, category: 'commercial' },
  // 季節・食
  { name: '八十八夜', month: 5, day: 2, category: 'food', description: '新茶の季節' },
  // 旅行
  { name: 'GW(ゴールデンウィーク)', month: 5, day: 3, category: 'travel', description: '大型連休' },
  // 天文
  { name: 'みずがめ座η流星群', month: 5, day: 6, category: 'astronomy' },
  // 記念日
  { name: 'ゴーゴーの日', month: 5, day: 5, category: 'anniversary' },

  // ========================================
  // 6月
  // ========================================
  // 季節
  { name: '衣替え', month: 6, day: 1, category: 'seasonal' },
  { name: '梅雨入り(関東)', month: 6, day: 8, category: 'seasonal', description: '平年の梅雨入り' },
  { name: '夏至', month: 6, day: 21, category: 'seasonal' },
  // 商業
  { name: '父の日', month: 6, day: null, weekOfMonth: 3, dayOfWeek: 0, category: 'commercial' },
  // 健康
  { name: '熱中症注意期間開始', month: 6, day: 15, category: 'health' },
  // ビジネス
  { name: '株主総会シーズン', month: 6, day: 20, category: 'business', description: '3月決算企業' },
  // 記念日
  { name: 'ロールケーキの日', month: 6, day: 6, category: 'anniversary', description: '6をロールに見立て' },

  // ========================================
  // 7月
  // ========================================
  // 祝日
  { name: '海の日', month: 7, day: null, weekOfMonth: 3, dayOfWeek: 1, category: 'holiday' },
  // 伝統行事
  { name: '七夕', month: 7, day: 7, category: 'cultural' },
  // 食
  { name: '土用の丑の日', month: 7, day: 24, category: 'food', description: 'うなぎを食べる日' },
  // 学校
  { name: '夏休み開始', month: 7, day: 20, category: 'school' },
  // 季節
  { name: '梅雨明け(関東)', month: 7, day: 19, category: 'seasonal', description: '平年の梅雨明け' },
  // ビジネス
  { name: '夏のボーナス', month: 7, day: 10, category: 'business', description: '多くの企業で支給' },
  // 天文
  { name: 'みずがめ座δ流星群', month: 7, day: 30, category: 'astronomy' },
  // 記念日
  { name: 'ナナの日', month: 7, day: 7, category: 'anniversary' },

  // ========================================
  // 8月
  // ========================================
  // 祝日
  { name: '山の日', month: 8, day: 11, category: 'holiday' },
  // 伝統行事・宗教
  { name: 'お盆', month: 8, day: 13, category: 'spiritual', description: '先祖供養' },
  { name: '地蔵盆', month: 8, day: 24, category: 'spiritual' },
  // 文化
  { name: '花火大会シーズン', month: 8, day: 1, category: 'cultural' },
  // 旅行
  { name: 'お盆帰省', month: 8, day: 13, category: 'travel' },
  // その他
  { name: '終戦記念日', month: 8, day: 15, category: 'other' },
  // 天文
  { name: 'ペルセウス座流星群', month: 8, day: 12, category: 'astronomy', description: '三大流星群の一つ' },
  // 学校
  { name: '夏休み終了', month: 8, day: 31, category: 'school' },

  // ========================================
  // 9月
  // ========================================
  // 祝日
  { name: '敬老の日', month: 9, day: null, weekOfMonth: 3, dayOfWeek: 1, category: 'holiday' },
  { name: '秋分の日', month: 9, day: 23, category: 'holiday' },
  // 伝統行事
  { name: '十五夜', month: 9, day: 17, category: 'cultural', description: '中秋の名月(年により異なる)' },
  { name: 'お彼岸(秋)', month: 9, day: 20, category: 'spiritual' },
  // その他
  { name: '防災の日', month: 9, day: 1, category: 'other' },
  // 学校
  { name: '新学期開始', month: 9, day: 1, category: 'school' },
  // 旅行
  { name: 'シルバーウィーク', month: 9, day: 19, category: 'travel' },
  // 記念日
  { name: '苦労の日', month: 9, day: 6, category: 'anniversary', description: '9(く)6(ろう)' },

  // ========================================
  // 10月
  // ========================================
  // 祝日
  { name: 'スポーツの日', month: 10, day: null, weekOfMonth: 2, dayOfWeek: 1, category: 'holiday' },
  // 季節
  { name: '衣替え', month: 10, day: 1, category: 'seasonal' },
  // スポーツ
  { name: '運動会・体育祭シーズン', month: 10, day: 10, category: 'sports' },
  // 商業
  { name: 'ハロウィン', month: 10, day: 31, category: 'commercial' },
  // 旅行
  { name: '紅葉シーズン開始', month: 10, day: 20, category: 'travel' },
  // 天文
  { name: 'オリオン座流星群', month: 10, day: 21, category: 'astronomy' },
  // 記念日
  { name: '目の愛護デー', month: 10, day: 10, category: 'anniversary', description: '10.10が眉目に見える' },
  // 健康
  { name: 'インフルエンザ予防接種開始', month: 10, day: 1, category: 'health' },

  // ========================================
  // 11月
  // ========================================
  // 祝日
  { name: '文化の日', month: 11, day: 3, category: 'holiday' },
  { name: '勤労感謝の日', month: 11, day: 23, category: 'holiday' },
  // 伝統行事・家族
  { name: '七五三', month: 11, day: 15, category: 'family' },
  // 宗教
  { name: '酉の市', month: 11, day: 8, category: 'spiritual', description: '11月の酉の日' },
  // 商業
  { name: 'ブラックフライデー', month: 11, day: null, weekOfMonth: 4, dayOfWeek: 5, category: 'commercial' },
  // 旅行
  { name: '紅葉見頃', month: 11, day: 15, category: 'travel' },
  // 食
  { name: 'ボジョレーヌーボー解禁', month: 11, day: null, weekOfMonth: 3, dayOfWeek: 4, category: 'food' },
  // 記念日
  { name: 'ポッキーの日', month: 11, day: 11, category: 'anniversary', description: '1111がポッキーに見える' },
  { name: 'いい夫婦の日', month: 11, day: 22, category: 'anniversary', description: '11(いい)22(ふうふ)' },
  // 天文
  { name: 'しし座流星群', month: 11, day: 17, category: 'astronomy' },

  // ========================================
  // 12月
  // ========================================
  // 季節
  { name: '冬至', month: 12, day: 22, category: 'seasonal' },
  // 商業
  { name: 'クリスマスイブ', month: 12, day: 24, category: 'commercial' },
  { name: 'クリスマス', month: 12, day: 25, category: 'commercial' },
  // 伝統行事
  { name: '大晦日', month: 12, day: 31, category: 'cultural', description: '年越しそば' },
  { name: '大掃除', month: 12, day: 28, category: 'cultural' },
  { name: '大祓', month: 12, day: 31, category: 'spiritual', description: '年越の祓' },
  // ビジネス
  { name: '冬のボーナス', month: 12, day: 10, category: 'business', description: '多くの企業で支給' },
  { name: '仕事納め', month: 12, day: 28, category: 'business' },
  // その他
  { name: '年末年始休暇', month: 12, day: 29, category: 'other' },
  // エンタメ
  { name: '紅白歌合戦', month: 12, day: 31, category: 'entertainment' },
  { name: 'レコード大賞', month: 12, day: 30, category: 'entertainment' },
  // 天文
  { name: 'ふたご座流星群', month: 12, day: 14, category: 'astronomy', description: '三大流星群の一つ' },
  // 健康
  { name: 'インフルエンザ流行期', month: 12, day: 15, category: 'health' },
  // 記念日
  { name: 'いい肉の日', month: 12, day: 29, category: 'anniversary', description: '12(いい)29(にく)' },

  // ========================================
  // 追加の記念日（毎月）
  // ========================================
  // 肉の日（毎月29日） - 代表で2月を登録
  { name: '肉の日', month: 2, day: 29, category: 'anniversary', description: '毎月29日は肉の日' },
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
