'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { FocusItem, MonthTheme, WeekPlan, YearlyVision, YearlyGoal, Area, AREA_LABELS } from '@/lib/types'
import { PlannerResult } from '@/lib/planner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AreaTabs } from '@/components/ui/area-tabs'
import { FocusItemCard } from '@/components/focus/focus-item'
import { AddFocusForm } from '@/components/focus/add-focus-form'
import { ProposalPanel } from '@/components/proposal/proposal-panel'
import { ThemeList } from '@/components/theme/theme-list'
import { WeekSummary } from '@/components/week/week-summary'
import { YearlyVisionCard } from '@/components/yearly/yearly-vision'
import { YearlyGoalsList } from '@/components/yearly/yearly-goals'
import { generateProposal } from '@/app/actions/planner'
import { getHomeData } from '@/app/actions/home'

interface HomeClientProps {
  formattedDate: string
  currentMonth: string
  currentYear: number
}

export function HomeClient({
  formattedDate,
  currentMonth,
  currentYear,
}: HomeClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [area, setArea] = useState<Area>('private')
  const [isAddingFocus, setIsAddingFocus] = useState(false)
  const [proposal, setProposal] = useState<PlannerResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Data state
  const [focusItems, setFocusItems] = useState<FocusItem[]>([])
  const [monthThemes, setMonthThemes] = useState<MonthTheme[]>([])
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null)
  const [yearlyVision, setYearlyVision] = useState<YearlyVision | null>(null)
  const [yearlyGoals, setYearlyGoals] = useState<YearlyGoal[]>([])

  // Fetch data when area changes
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const data = await getHomeData(area)
        setFocusItems(data.focusItems)
        setMonthThemes(data.monthThemes)
        setWeekPlan(data.weekPlan)
        setYearlyVision(data.yearlyVision)
        setYearlyGoals(data.yearlyGoals)
      } catch (error) {
        toast.error('データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [area])

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await getHomeData(area)
      setFocusItems(data.focusItems)
      setMonthThemes(data.monthThemes)
      setWeekPlan(data.weekPlan)
      setYearlyVision(data.yearlyVision)
      setYearlyGoals(data.yearlyGoals)
    } catch (error) {
      toast.error('データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateProposal = async () => {
    setIsGenerating(true)
    try {
      const result = await generateProposal()
      setProposal(result)
    } catch (error) {
      toast.error('提案の生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAdoptProposal = () => {
    setProposal(null)
    handleRefresh()
  }

  const handleDiscardProposal = () => {
    setProposal(null)
  }

  const activeFocusItems = focusItems.filter(
    (item) => item.status === 'planned'
  )
  const completedFocusItems = focusItems.filter(
    (item) => item.status === 'done' || item.status === 'skipped'
  )

  // Format month for display (e.g., "1月" from "2024-01")
  const monthDisplay = `${parseInt(currentMonth.split('-')[1], 10)}月`
  const areaLabel = AREA_LABELS[area]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-calm-800">リラックス</h1>
          <p className="text-calm-500">{formattedDate}</p>
        </div>
        <Link href="/calendar">
          <Button variant="secondary" size="sm">📅 カレンダー</Button>
        </Link>
      </header>

      {/* Area Tabs */}
      <AreaTabs value={area} onChange={setArea} />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse p-5">
                <div className="h-5 bg-calm-200 rounded w-32 mb-4" />
                <div className="h-16 bg-calm-100 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Section 1: 今日のフォーカス */}
          <Card className="border-2 border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>今日</Badge>
                <CardTitle>フォーカス</CardTitle>
              </div>
              {!proposal && !isAddingFocus && activeFocusItems.length < 3 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingFocus(true)}
                >
                  + 追加
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {proposal && (
                <div className="mb-4">
                  <ProposalPanel
                    proposal={proposal}
                    onAdopt={handleAdoptProposal}
                    onDiscard={handleDiscardProposal}
                  />
                </div>
              )}

              {isAddingFocus && (
                <div className="mb-4 p-4 rounded-lg border border-calm-200 bg-calm-50">
                  <AddFocusForm
                    area={area}
                    onSuccess={() => {
                      setIsAddingFocus(false)
                      handleRefresh()
                    }}
                    onCancel={() => setIsAddingFocus(false)}
                  />
                </div>
              )}

              {activeFocusItems.length === 0 && !isAddingFocus && !proposal && (
                <div className="text-center py-8">
                  <p className="text-calm-400 mb-4">
                    {areaLabel}のフォーカスがありません
                  </p>
                  <Button onClick={handleGenerateProposal} loading={isGenerating}>
                    提案を生成
                  </Button>
                </div>
              )}

              {activeFocusItems.length > 0 && (
                <div className="space-y-3">
                  {activeFocusItems.map((item) => (
                    <FocusItemCard
                      key={item.id}
                      item={item}
                      onUpdate={handleRefresh}
                    />
                  ))}
                </div>
              )}

              {activeFocusItems.length > 0 &&
                activeFocusItems.length < 3 &&
                !proposal &&
                !isAddingFocus && (
                  <div className="mt-4 pt-4 border-t border-calm-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerateProposal}
                      loading={isGenerating}
                    >
                      提案を生成
                    </Button>
                  </div>
                )}

              {completedFocusItems.length > 0 && (
                <details className="mt-4 pt-4 border-t border-calm-100">
                  <summary className="text-sm text-calm-400 cursor-pointer hover:text-calm-600">
                    完了・スキップ ({completedFocusItems.length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {completedFocusItems.map((item) => (
                      <FocusItemCard
                        key={item.id}
                        item={item}
                        onUpdate={handleRefresh}
                      />
                    ))}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>

          {/* Section 2: 今週の流れ */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="muted">週間</Badge>
                <CardTitle>今週の流れ</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <WeekSummary weekPlan={weekPlan} />
            </CardContent>
          </Card>

          {/* Section 3: 今月のテーマ */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="muted">月間</Badge>
                <CardTitle>{monthDisplay}のテーマ</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeList
                themes={monthThemes}
                yearlyGoals={yearlyGoals}
                area={area}
                maxItems={5}
              />
            </CardContent>
          </Card>

          {/* Section 4: 年間目標 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="muted">年間</Badge>
                <CardTitle>{currentYear}年の目標</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <YearlyGoalsList
                goals={yearlyGoals}
                year={currentYear}
                area={area}
                visionId={yearlyVision?.id}
                maxItems={5}
                onUpdate={handleRefresh}
              />
            </CardContent>
          </Card>

          {/* Section 5: 年間ビジョン */}
          <Card className="bg-gradient-to-br from-calm-50 to-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="muted">ビジョン</Badge>
                <CardTitle>{currentYear}年のビジョン</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <YearlyVisionCard vision={yearlyVision} year={currentYear} area={area} onUpdate={handleRefresh} />
            </CardContent>
          </Card>

          {/* 階層の説明 */}
          <div className="text-center py-4">
            <p className="text-xs text-calm-400">
              ビジョン → 年間目標 → 月間テーマ → 週間の流れ → 今日のフォーカス
            </p>
          </div>
        </>
      )}
    </div>
  )
}
