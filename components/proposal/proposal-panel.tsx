'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PlannerResult } from '@/lib/planner'
import { ProposedFocusItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adoptProposal } from '@/app/actions/planner'

interface ProposalPanelProps {
  proposal: PlannerResult
  onAdopt: () => void
  onDiscard: () => void
}

const durationLabels: Record<number, string> = {
  5: '5分',
  10: '10分',
  30: '30分',
  60: '1時間',
}

const loadLabels: Record<number, string> = {
  1: '軽',
  2: '軽め',
  3: '普通',
  4: 'やや重',
  5: '重',
}

export function ProposalPanel({ proposal, onAdopt, onDiscard }: ProposalPanelProps) {
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(
    new Set(proposal.output.proposedFocusItems.map((_, i) => i))
  )

  const toggleItem = (index: number) => {
    const newSet = new Set(selectedItems)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedItems(newSet)
  }

  const handleAdopt = async () => {
    if (selectedItems.size === 0) {
      toast.error('少なくとも1つ選択してください')
      return
    }

    setLoading(true)
    try {
      const itemsToAdopt = proposal.output.proposedFocusItems.filter((_, i) =>
        selectedItems.has(i)
      )
      await adoptProposal(itemsToAdopt)
      toast.success('提案を採用しました')
      onAdopt()
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-accent-light/20 p-5 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-calm-800">提案</h3>
        <Badge variant={proposal.source === 'ai' ? 'default' : 'muted'}>
          {proposal.source === 'ai' ? 'AI' : 'ルールベース'}
        </Badge>
      </div>

      <p className="text-sm text-calm-600 mb-4">{proposal.output.summary}</p>

      <div className="space-y-3 mb-4">
        {proposal.output.proposedFocusItems.map((item, index) => (
          <ProposedItemCard
            key={index}
            item={item}
            selected={selectedItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>

      {proposal.output.proposedWeekDiff.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-white/50">
          <p className="text-xs font-medium text-calm-500 mb-2">週の計画への提案</p>
          {proposal.output.proposedWeekDiff.map((diff, index) => (
            <p key={index} className="text-sm text-calm-600">
              {diff.reason}
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDiscard} disabled={loading}>
          破棄
        </Button>
        <Button onClick={handleAdopt} loading={loading}>
          採用 ({selectedItems.size})
        </Button>
      </div>
    </div>
  )
}

interface ProposedItemCardProps {
  item: ProposedFocusItem
  selected: boolean
  onToggle: () => void
}

function ProposedItemCard({ item, selected, onToggle }: ProposedItemCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        selected
          ? 'border-accent bg-white shadow-sm'
          : 'border-transparent bg-white/50 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? 'border-accent bg-accent' : 'border-calm-300'
          }`}
        >
          {selected && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-calm-800">{item.title}</p>
          {item.intention && (
            <p className="mt-0.5 text-sm text-calm-500">{item.intention}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="muted">{durationLabels[item.duration]}</Badge>
            <Badge variant="muted">負荷: {loadLabels[item.load]}</Badge>
          </div>
          <p className="mt-2 text-xs text-accent-dark">{item.reason}</p>
        </div>
      </div>
    </button>
  )
}
