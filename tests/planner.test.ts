import { describe, it, expect } from 'vitest'
import { generateDeterministicPlan } from '@/lib/planner/deterministic'
import { PlannerInput, PlannerOutputSchema } from '@/lib/types'

describe('Deterministic Planner', () => {
  const baseInput: PlannerInput = {
    monthThemes: [],
    weekPlan: null,
    recentFocusItems: [],
    recentReflections: [],
    targetDate: '2024-01-15',
  }

  it('should return valid output structure', () => {
    const result = generateDeterministicPlan(baseInput)

    const validation = PlannerOutputSchema.safeParse(result)
    expect(validation.success).toBe(true)
  })

  it('should return max 3 focus items', () => {
    const result = generateDeterministicPlan(baseInput)

    expect(result.proposedFocusItems.length).toBeLessThanOrEqual(3)
  })

  it('should include reasons for each proposed item', () => {
    const result = generateDeterministicPlan(baseInput)

    for (const item of result.proposedFocusItems) {
      expect(item.reason).toBeDefined()
      expect(item.reason.length).toBeGreaterThan(0)
      expect(item.reason.length).toBeLessThanOrEqual(200)
    }
  })

  it('should generate items based on month themes', () => {
    const inputWithThemes: PlannerInput = {
      ...baseInput,
      monthThemes: [
        {
          id: 'theme1',
          userId: 'local',
          month: '2024-01',
          title: '健康的な生活',
          order: 0,
        },
        {
          id: 'theme2',
          userId: 'local',
          month: '2024-01',
          title: '新しいスキル',
          order: 1,
        },
      ],
    }

    const result = generateDeterministicPlan(inputWithThemes)

    expect(result.proposedFocusItems.length).toBeGreaterThan(0)
    expect(result.proposedFocusItems.some((item) => item.themeId)).toBe(true)
  })

  it('should reduce load when recent reflections show failures', () => {
    const inputWithFailures: PlannerInput = {
      ...baseInput,
      monthThemes: [
        {
          id: 'theme1',
          userId: 'local',
          month: '2024-01',
          title: 'テスト',
          order: 0,
        },
      ],
      recentReflections: [
        {
          id: 'ref1',
          userId: 'local',
          date: '2024-01-14',
          result: 'not_done',
          reasonCode: 'too_busy',
          note: null,
        },
        {
          id: 'ref2',
          userId: 'local',
          date: '2024-01-13',
          result: 'partial',
          reasonCode: null,
          note: null,
        },
      ],
    }

    const result = generateDeterministicPlan(inputWithFailures)

    // Should suggest only 1 item when there are recent failures
    expect(result.proposedFocusItems.length).toBe(1)

    // Summary should mention lighter pace
    expect(result.summary).toContain('軽め')
  })

  it('should suggest generic focus when no themes exist', () => {
    const result = generateDeterministicPlan(baseInput)

    expect(result.proposedFocusItems.length).toBeGreaterThan(0)
    expect(result.proposedFocusItems[0].title).toBeDefined()
  })

  it('should have valid duration values', () => {
    const result = generateDeterministicPlan(baseInput)

    for (const item of result.proposedFocusItems) {
      expect([5, 10, 30, 60]).toContain(item.duration)
    }
  })

  it('should have valid load values', () => {
    const result = generateDeterministicPlan(baseInput)

    for (const item of result.proposedFocusItems) {
      expect([1, 2, 3, 4, 5]).toContain(item.load)
    }
  })

  it('should include summary', () => {
    const result = generateDeterministicPlan(baseInput)

    expect(result.summary).toBeDefined()
    expect(result.summary.length).toBeGreaterThan(0)
    expect(result.summary.length).toBeLessThanOrEqual(300)
  })

  it('should suggest rest day when week is overloaded', () => {
    const busyWeekInput: PlannerInput = {
      ...baseInput,
      weekPlan: {
        id: 'wp1',
        userId: 'local',
        weekStart: '2024-01-15',
        weekMap: {
          days: [
            { dayOfWeek: 0, date: '2024-01-15', focusTitle: 'Work', isRest: false },
            { dayOfWeek: 1, date: '2024-01-16', focusTitle: 'Work', isRest: false },
            { dayOfWeek: 2, date: '2024-01-17', focusTitle: 'Work', isRest: false },
            { dayOfWeek: 3, date: '2024-01-18', focusTitle: 'Work', isRest: false },
            { dayOfWeek: 4, date: '2024-01-19', focusTitle: 'Work', isRest: false },
            { dayOfWeek: 5, date: '2024-01-20', focusTitle: 'Work', isRest: false },
            { dayOfWeek: 6, date: '2024-01-21', isRest: false },
          ],
          weeklyGoal: 'Test',
        },
      },
    }

    const result = generateDeterministicPlan(busyWeekInput)

    // Should suggest making a day a rest day
    expect(result.proposedWeekDiff.length).toBeGreaterThan(0)
    expect(result.proposedWeekDiff.some((diff) => diff.field === 'isRest')).toBe(
      true
    )
  })
})
