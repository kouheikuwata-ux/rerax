'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center">
        <h2 className="text-lg font-semibold text-calm-800 mb-2">
          エラーが発生しました
        </h2>
        <p className="text-sm text-calm-500 mb-6">
          申し訳ありません。問題が発生しました。
        </p>
        <Button onClick={reset}>再試行</Button>
      </Card>
    </div>
  )
}
