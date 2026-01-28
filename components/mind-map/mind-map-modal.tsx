'use client'

import { useState, useEffect, useCallback, Component, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { getMindMap, saveMindMap } from '@/app/actions/mind-map'
import { MindMapNode, EntityType } from '@/lib/types'

// Error boundary to catch React Flow errors
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class MindMapErrorBoundary extends Component<{ children: ReactNode; onError?: () => void }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; onError?: () => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MindMap Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-calm-50">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">マインドマップの読み込みに失敗しました</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-calm-600 text-white rounded-lg hover:bg-calm-700"
            >
              再試行
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Dynamically import MindMapEditor with no SSR to avoid CSS import issues
const MindMapEditor = dynamic(
  () => import('./mind-map-editor').then((mod) => mod.MindMapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-calm-50">
        <div className="text-calm-500">読み込み中...</div>
      </div>
    ),
  }
)

interface MindMapModalProps {
  open: boolean
  onClose: () => void
  entityType: EntityType
  entityId: string
  title: string
}

export function MindMapModal({
  open,
  onClose,
  entityType,
  entityId,
  title,
}: MindMapModalProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cssLoaded, setCssLoaded] = useState(false)

  // Load React Flow CSS on client side via link tag
  useEffect(() => {
    if (open && !cssLoaded) {
      const linkId = 'xyflow-styles'
      const existingLink = document.getElementById(linkId) as HTMLLinkElement | null

      if (existingLink) {
        // CSS already loaded
        setCssLoaded(true)
      } else {
        const link = document.createElement('link')
        link.id = linkId
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/@xyflow/react@12/dist/style.min.css'
        link.onload = () => setCssLoaded(true)
        link.onerror = () => {
          console.error('Failed to load React Flow CSS')
          setCssLoaded(true) // Continue anyway
        }
        document.head.appendChild(link)
      }
    }
  }, [open, cssLoaded])

  useEffect(() => {
    if (open) {
      setLoading(true)
      getMindMap(entityType, entityId)
        .then(setNodes)
        .finally(() => setLoading(false))
    }
  }, [open, entityType, entityId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const handleSave = useCallback(
    async (
      nodesToSave: Array<{
        id?: string
        parentId?: string | null
        nodeType?: string
        label: string
        positionX: number
        positionY: number
        width?: number | null
        height?: number | null
        color: string
        imageUrl?: string | null
      }>
    ): Promise<MindMapNode[]> => {
      setSaving(true)
      try {
        const savedNodes = await saveMindMap(entityType, entityId, nodesToSave)
        setNodes(savedNodes)
        return savedNodes
      } finally {
        setSaving(false)
      }
    },
    [entityType, entityId]
  )

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-calm-200 bg-white relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-calm-100 hover:bg-calm-200 rounded-lg transition-colors text-calm-700 font-medium"
            title="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <h2 className="text-lg font-semibold text-calm-800">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-calm-500">マインドマップ</span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {loading || !cssLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-calm-50">
            <div className="text-calm-500">読み込み中...</div>
          </div>
        ) : (
          <MindMapErrorBoundary>
            <MindMapEditor
              initialNodes={nodes}
              onSave={handleSave}
              saving={saving}
            />
          </MindMapErrorBoundary>
        )}
      </div>
    </div>,
    document.body
  )
}
