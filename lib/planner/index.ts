import { PlannerInput, PlannerOutput, PlannerInputSchema } from '@/lib/types'
import { generateAIPlan } from './openai'
import { generateDeterministicPlan } from './deterministic'

export type PlannerResult = {
  output: PlannerOutput
  source: 'ai' | 'deterministic'
}

/**
 * Generate a plan proposal using AI (if available) or deterministic rules.
 * AI never auto-writes to DB - user must explicitly adopt the proposal.
 */
export async function generatePlan(input: PlannerInput): Promise<PlannerResult> {
  // Validate input
  const validated = PlannerInputSchema.safeParse(input)
  if (!validated.success) {
    throw new Error(`Invalid planner input: ${validated.error.message}`)
  }

  // Try AI first
  const aiResult = await generateAIPlan(validated.data)

  if (aiResult) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Planner] Using AI-generated plan')
    }
    return {
      output: aiResult,
      source: 'ai',
    }
  }

  // Fallback to deterministic rules
  if (process.env.NODE_ENV === 'development') {
    console.log('[Planner] Using deterministic plan (AI unavailable)')
  }

  return {
    output: generateDeterministicPlan(validated.data),
    source: 'deterministic',
  }
}

export { generateDeterministicPlan } from './deterministic'
export { generateAIPlan } from './openai'
