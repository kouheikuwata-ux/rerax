import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { CalendarClient } from './calendar-client'

export const dynamic = 'force-dynamic'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-calm-200 rounded w-48 mb-2" />
      </div>
      <div className="h-12 bg-calm-100 rounded-lg" />
      <Card>
        <div className="animate-pulse p-5">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-calm-100 rounded" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <main>
      <Suspense fallback={<LoadingSkeleton />}>
        <CalendarClient />
      </Suspense>
    </main>
  )
}
