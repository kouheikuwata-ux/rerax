import { z } from 'zod'

// ============================================
// Core Enums
// ============================================

export const DurationSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(30),
  z.literal(60),
])
export type Duration = z.infer<typeof DurationSchema>

export const LoadSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])
export type Load = z.infer<typeof LoadSchema>

export const FocusStatusSchema = z.enum(['planned', 'done', 'skipped'])
export type FocusStatus = z.infer<typeof FocusStatusSchema>

export const ReflectionResultSchema = z.enum(['done', 'partial', 'not_done'])
export type ReflectionResult = z.infer<typeof ReflectionResultSchema>

export const ReasonCodeSchema = z.enum([
  'completed',
  'too_busy',
  'sick',
  'changed_priority',
  'not_ready',
  'other',
])
export type ReasonCode = z.infer<typeof ReasonCodeSchema>

export const AreaSchema = z.enum(['work', 'private'])
export type Area = z.infer<typeof AreaSchema>

export const AREA_LABELS: Record<Area, string> = {
  work: '仕事',
  private: 'プライベート',
}

export const EntityTypeSchema = z.enum(['focus', 'theme', 'goal', 'vision'])
export type EntityType = z.infer<typeof EntityTypeSchema>

// ============================================
// Yearly Vision (年間ビジョン)
// ============================================

export const YearlyVisionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  year: z.number().int().min(2020).max(2100),
  area: AreaSchema,
  title: z.string().min(1).max(200),
  keywords: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type YearlyVision = z.infer<typeof YearlyVisionSchema>

export const CreateYearlyVisionSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  area: AreaSchema,
  title: z.string().min(1).max(200),
  keywords: z.string().optional(),
})
export type CreateYearlyVision = z.infer<typeof CreateYearlyVisionSchema>

// ============================================
// Yearly Goal (年間目標)
// ============================================

export const YearlyGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  year: z.number().int().min(2020).max(2100),
  area: AreaSchema,
  title: z.string().min(1).max(200),
  order: z.number().int().min(0),
  visionId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type YearlyGoal = z.infer<typeof YearlyGoalSchema>

export const CreateYearlyGoalSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  area: AreaSchema,
  title: z.string().min(1).max(200),
  visionId: z.string().optional(),
})
export type CreateYearlyGoal = z.infer<typeof CreateYearlyGoalSchema>

// ============================================
// Month Theme (月間テーマ)
// ============================================

export const MonthThemeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  area: AreaSchema,
  title: z.string().min(1).max(100),
  order: z.number().int().min(0),
  yearlyGoalId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type MonthTheme = z.infer<typeof MonthThemeSchema>

export const CreateMonthThemeSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  area: AreaSchema,
  title: z.string().min(1).max(100),
  yearlyGoalId: z.string().optional(),
})
export type CreateMonthTheme = z.infer<typeof CreateMonthThemeSchema>

// ============================================
// Week Plan
// ============================================

export const DaySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Monday, 6 = Sunday
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  focusTitle: z.string().optional(),
  note: z.string().optional(),
  isRest: z.boolean().default(false),
})
export type DaySlot = z.infer<typeof DaySlotSchema>

export const WeekMapSchema = z.object({
  days: z.array(DaySlotSchema).length(7),
  weeklyGoal: z.string().optional(),
})
export type WeekMap = z.infer<typeof WeekMapSchema>

export const WeekPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekMap: WeekMapSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type WeekPlan = z.infer<typeof WeekPlanSchema>

// ============================================
// Focus Item
// ============================================

export const FocusItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  area: AreaSchema,
  title: z.string().min(1).max(200),
  duration: DurationSchema,
  load: LoadSchema,
  deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  themeId: z.string().nullable(),
  intention: z.string().max(500).nullable(),
  status: FocusStatusSchema,
  order: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type FocusItem = z.infer<typeof FocusItemSchema>

export const CreateFocusItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  area: AreaSchema.default('private'),
  title: z.string().min(1).max(200),
  duration: DurationSchema.default(30),
  load: LoadSchema.default(3),
  deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  themeId: z.string().optional(),
  intention: z.string().max(500).optional(),
})
export type CreateFocusItem = z.infer<typeof CreateFocusItemSchema>

export const UpdateFocusItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  duration: DurationSchema.optional(),
  load: LoadSchema.optional(),
  deadlineDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  themeId: z.string().nullable().optional(),
  intention: z.string().max(500).nullable().optional(),
  status: FocusStatusSchema.optional(),
  order: z.number().int().min(0).optional(),
})
export type UpdateFocusItem = z.infer<typeof UpdateFocusItemSchema>

// ============================================
// Reflection Log
// ============================================

export const ReflectionLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  result: ReflectionResultSchema,
  reasonCode: ReasonCodeSchema.nullable(),
  note: z.string().max(500).nullable(),
  createdAt: z.date(),
})
export type ReflectionLog = z.infer<typeof ReflectionLogSchema>

export const CreateReflectionLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  result: ReflectionResultSchema,
  reasonCode: ReasonCodeSchema.optional(),
  note: z.string().max(500).optional(),
})
export type CreateReflectionLog = z.infer<typeof CreateReflectionLogSchema>

// ============================================
// Mind Map Node
// ============================================

export const MindMapNodeTypeSchema = z.enum(['mindMapNode', 'stickyNote', 'section', 'image'])
export type MindMapNodeType = z.infer<typeof MindMapNodeTypeSchema>

export const MindMapNodeSchema = z.object({
  id: z.string(),
  entityType: EntityTypeSchema,
  entityId: z.string(),
  parentId: z.string().nullable(),
  nodeType: MindMapNodeTypeSchema.default('mindMapNode'),
  label: z.string().max(2000),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  color: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type MindMapNode = z.infer<typeof MindMapNodeSchema>

export const CreateMindMapNodeSchema = z.object({
  entityType: EntityTypeSchema,
  entityId: z.string(),
  parentId: z.string().nullable().optional(),
  nodeType: MindMapNodeTypeSchema.optional(),
  label: z.string().max(2000),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  color: z.string().optional(),
  imageUrl: z.string().optional(),
})
export type CreateMindMapNode = z.infer<typeof CreateMindMapNodeSchema>

export const UpdateMindMapNodeSchema = z.object({
  parentId: z.string().nullable().optional(),
  nodeType: MindMapNodeTypeSchema.optional(),
  label: z.string().max(2000).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  color: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
})
export type UpdateMindMapNode = z.infer<typeof UpdateMindMapNodeSchema>

// ============================================
// AI Planner Types
// ============================================

export const PlannerInputSchema = z.object({
  monthThemes: z.array(MonthThemeSchema.omit({ createdAt: true, updatedAt: true })),
  weekPlan: WeekPlanSchema.omit({ createdAt: true, updatedAt: true }).nullable(),
  recentFocusItems: z.array(FocusItemSchema.omit({ createdAt: true, updatedAt: true })),
  recentReflections: z.array(ReflectionLogSchema.omit({ createdAt: true })),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
export type PlannerInput = z.infer<typeof PlannerInputSchema>

export const ProposedFocusItemSchema = z.object({
  title: z.string().min(1).max(200),
  duration: DurationSchema,
  load: LoadSchema,
  themeId: z.string().optional(),
  intention: z.string().max(500).optional(),
  reason: z.string().max(200), // 1-line explanation
})
export type ProposedFocusItem = z.infer<typeof ProposedFocusItemSchema>

export const WeekDiffSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  field: z.enum(['focusTitle', 'note', 'isRest']),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  reason: z.string().max(200),
})
export type WeekDiff = z.infer<typeof WeekDiffSchema>

export const PlannerOutputSchema = z.object({
  proposedFocusItems: z.array(ProposedFocusItemSchema).max(3),
  proposedWeekDiff: z.array(WeekDiffSchema),
  summary: z.string().max(300), // Brief explanation of the proposal
})
export type PlannerOutput = z.infer<typeof PlannerOutputSchema>
