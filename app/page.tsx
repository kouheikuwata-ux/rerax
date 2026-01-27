import { Suspense } from 'react'
import { formatDateJa, getCurrentMonthStr } from '@/lib/date-utils'
import { Card } from '@/components/ui/card'
import { HomeClient } from './home-client'

export const dynamic = 'force-dynamic'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-calm-200 rounded w-48 mb-2" />
        <div className="h-4 bg-calm-100 rounded w-32" />
      </div>

      <div className="h-12 bg-calm-100 rounded-lg" />

      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <div className="animate-pulse">
            <div className="h-5 bg-calm-200 rounded w-32 mb-4" />
            <div className="space-y-2">
              <div className="h-12 bg-calm-100 rounded" />
              <div className="h-12 bg-calm-100 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function HomePage() {
  const currentMonth = getCurrentMonthStr()
  const today = new Date()
  const formattedDate = formatDateJa(today, 'M月d日(E)')
  const currentYear = today.getFullYear()

  return (
    <main>
      <Suspense fallback={<LoadingSkeleton />}>
        <HomeClient
          formattedDate={formattedDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </Suspense>
    </main>
  )
}
