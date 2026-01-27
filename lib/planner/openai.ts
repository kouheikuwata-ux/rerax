import OpenAI from 'openai'
import { PlannerInput, PlannerOutput, PlannerOutputSchema } from '@/lib/types'

const SYSTEM_PROMPT = `あなたは「リラックス」というタスク管理アプリのプランナーAIです。
ユーザーの今月のテーマ、今週の計画、最近のフォーカスアイテム、振り返りを基に、今日のフォーカス提案を行います。

## 重要な制約
- 提案は最大3つまで（推奨は1-2つ）
- 認知負荷を低く保つ：シンプルで実行可能な提案を心がける
- ユーザーの振り返り結果を重視：失敗が続いている場合は負荷を下げる
- 各提案には必ず1行の理由を添える
- 「タスク」という言葉は使わず、「フォーカス」「流れ」「テーマ」を使う

## 負荷レベルの目安
1: とても軽い（5-10分で完了）
2: 軽い（15-20分で完了）
3: 普通（30分程度）
4: やや重い（45-60分）
5: 重い（1時間以上の集中が必要）

## 出力形式
厳密なJSON形式で出力してください。`

export async function generateAIPlan(input: PlannerInput): Promise<PlannerOutput | null> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.log('[Planner] OpenAI API key not found, skipping AI generation')
    return null
  }

  try {
    const openai = new OpenAI({ apiKey })

    const userMessage = `## 現在の状態

### 今月のテーマ (${input.monthThemes.length}件)
${input.monthThemes.map((t) => `- ${t.title}`).join('\n') || 'なし'}

### 今週の計画
${input.weekPlan ? formatWeekPlan(input.weekPlan.weekMap) : '未設定'}

### 最近のフォーカス (過去7日)
${input.recentFocusItems.map((f) => `- [${f.status}] ${f.title} (負荷: ${f.load})`).join('\n') || 'なし'}

### 最近の振り返り (過去3日)
${input.recentReflections.map((r) => `- ${r.date}: ${r.result}${r.note ? ` (${r.note})` : ''}`).join('\n') || 'なし'}

### 対象日
${input.targetDate}

上記を踏まえて、今日のフォーカス提案をJSON形式で出力してください。`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('[Planner] Empty response from OpenAI')
      return null
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Planner] OpenAI response:', content)
    }

    const parsed = JSON.parse(content)
    const validated = PlannerOutputSchema.safeParse(parsed)

    if (!validated.success) {
      console.error('[Planner] Invalid response structure:', validated.error)
      return null
    }

    return validated.data
  } catch (error) {
    console.error('[Planner] OpenAI API error:', error)
    return null
  }
}

function formatWeekPlan(weekMap: PlannerInput['weekPlan'] extends null ? never : NonNullable<PlannerInput['weekPlan']>['weekMap']): string {
  const days = ['月', '火', '水', '木', '金', '土', '日']
  return weekMap.days
    .map((d, i) => {
      const status = d.isRest ? '休' : d.focusTitle || '-'
      return `${days[i]}: ${status}`
    })
    .join(' | ')
}
