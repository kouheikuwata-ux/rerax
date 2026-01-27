import {
  PlannerInput,
  PlannerOutput,
  ProposedFocusItem,
  WeekDiff,
} from '@/lib/types'

// Type for focus items in planner input (without timestamps)
type PlannerFocusItem = PlannerInput['recentFocusItems'][number]
type PlannerMonthTheme = PlannerInput['monthThemes'][number]

/**
 * Deterministic planner fallback when OpenAI is not available.
 * Uses simple rules to generate suggestions based on context.
 */
export function generateDeterministicPlan(input: PlannerInput): PlannerOutput {
  const proposedFocusItems: ProposedFocusItem[] = []
  const proposedWeekDiff: WeekDiff[] = []

  // Analyze recent reflections to understand patterns
  const recentResults = input.recentReflections.map((r) => r.result)
  const hasRecentFailures = recentResults.some((r) => r === 'not_done' || r === 'partial')
  const averageLoad = calculateAverageLoad(input.recentFocusItems)

  // Rule 1: If recent failures, suggest lighter load
  const targetLoad = hasRecentFailures ? Math.max(2, averageLoad - 1) : Math.min(4, averageLoad)

  // Rule 2: Generate focus items based on monthly themes
  const unusedThemes = findUnusedThemes(input.monthThemes, input.recentFocusItems)

  // Suggest 1-3 focus items
  const numSuggestions = hasRecentFailures ? 1 : Math.min(2, Math.max(1, unusedThemes.length))

  for (let i = 0; i < numSuggestions; i++) {
    const theme = unusedThemes[i] || input.monthThemes[i]
    if (theme) {
      proposedFocusItems.push({
        title: generateFocusTitle(theme, i),
        duration: suggestDuration(targetLoad),
        load: targetLoad as 1 | 2 | 3 | 4 | 5,
        themeId: theme.id,
        intention: `今月のテーマ「${theme.title}」に向けた小さな一歩`,
        reason: hasRecentFailures
          ? '最近の振り返りを踏まえて、少し軽めの内容を提案しました'
          : `「${theme.title}」に関連する活動を提案しました`,
      })
    }
  }

  // If no themes, suggest a generic focus item
  if (proposedFocusItems.length === 0) {
    proposedFocusItems.push({
      title: '今日やりたいことを1つ決める',
      duration: 10,
      load: 2,
      intention: '小さく始めることで流れを作る',
      reason: 'テーマが未設定のため、まずは小さな一歩から始めることを提案します',
    })
  }

  // Rule 3: Check week plan and suggest rest days if overworked
  if (input.weekPlan) {
    const busyDays = input.weekPlan.weekMap.days.filter(
      (d) => d.focusTitle && !d.isRest
    ).length

    if (busyDays >= 6) {
      // Find first non-rest weekday and suggest making it lighter
      const targetDay = input.weekPlan.weekMap.days.find(
        (d) => d.dayOfWeek >= 4 && !d.isRest && d.focusTitle
      )

      if (targetDay) {
        proposedWeekDiff.push({
          dayOfWeek: targetDay.dayOfWeek,
          field: 'isRest',
          oldValue: 'false',
          newValue: 'true',
          reason: '週の後半に休息日を設けることで、持続可能なペースを保てます',
        })
      }
    }
  }

  // Generate summary
  let summary = ''
  if (hasRecentFailures) {
    summary = '最近の活動を振り返り、少し軽めのペースを提案します。無理なく続けることを優先しましょう。'
  } else if (proposedFocusItems.length === 1) {
    summary = '今日のフォーカスを1つに絞りました。集中して取り組んでみてください。'
  } else {
    summary = `${proposedFocusItems.length}つのフォーカスを提案します。優先度の高いものから取り組んでみてください。`
  }

  return {
    proposedFocusItems,
    proposedWeekDiff,
    summary,
  }
}

function calculateAverageLoad(items: PlannerFocusItem[]): number {
  if (items.length === 0) return 3
  const sum = items.reduce((acc, item) => acc + item.load, 0)
  return Math.round(sum / items.length)
}

function findUnusedThemes(
  themes: PlannerMonthTheme[],
  recentItems: PlannerFocusItem[]
): PlannerMonthTheme[] {
  const usedThemeIds = new Set(recentItems.map((item) => item.themeId).filter(Boolean))
  return themes.filter((theme) => !usedThemeIds.has(theme.id))
}

function generateFocusTitle(theme: PlannerMonthTheme, index: number): string {
  const prefixes = [
    '進める：',
    '考える：',
    '準備する：',
  ]
  const prefix = prefixes[index] || ''
  return `${prefix}${theme.title}`
}

function suggestDuration(load: number): 5 | 10 | 30 | 60 {
  if (load <= 2) return 10
  if (load <= 3) return 30
  return 30
}
