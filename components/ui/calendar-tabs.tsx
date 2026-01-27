'use client'

import { clsx } from 'clsx'

export type CalendarTab = 'private' | 'work' | 'events'

interface CalendarTabsProps {
  value: CalendarTab
  onChange: (tab: CalendarTab) => void
}

const TAB_CONFIG: Array<{ key: CalendarTab; label: string; icon: string }> = [
  { key: 'private', label: 'プライベート', icon: '🏠' },
  { key: 'work', label: '仕事', icon: '💼' },
  { key: 'events', label: 'イベント', icon: '📅' },
]

export function CalendarTabs({ value, onChange }: CalendarTabsProps) {
  return (
    <div className="flex bg-calm-100 rounded-lg p-1">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={clsx(
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
            value === tab.key
              ? 'bg-white text-calm-800 shadow-sm'
              : 'text-calm-500 hover:text-calm-700'
          )}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  )
}
