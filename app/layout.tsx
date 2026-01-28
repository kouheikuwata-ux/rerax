import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/providers/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'リラックス - 穏やかな計画',
  description: '夢・目標・計画を穏やかに管理する次世代TODOアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-calm-50 text-calm-800 antialiased">
        <SessionProvider>
          <div className="mx-auto max-w-2xl px-0 sm:px-4 py-2 sm:py-8">
            {children}
          </div>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: 'none',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
