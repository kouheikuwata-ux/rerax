'use client'

import { clsx } from 'clsx'
import { Area, AREA_LABELS } from '@/lib/types'

interface AreaTabsProps {
  value: Area
  onChange: (area: Area) => void
}

export function AreaTabs({ value, onChange }: AreaTabsProps) {
  return (
    <div className="flex bg-calm-100 rounded-lg p-1">
      {(['private', 'work'] as Area[]).map((area) => (
        <button
          key={area}
          type="button"
          onClick={() => onChange(area)}
          className={clsx(
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
            value === area
              ? 'bg-white text-calm-800 shadow-sm'
              : 'text-calm-500 hover:text-calm-700'
          )}
        >
          {area === 'private' ? '🏠 ' : '💼 '}
          {AREA_LABELS[area]}
        </button>
      ))}
    </div>
  )
}
