'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { getMindMap, saveMindMap } from '@/app/actions/mind-map'
import { MindMapNode, EntityType } from '@/lib/types'

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
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link')
        link.id = linkId
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/@xyflow/react@12/dist/style.min.css'
        document.head.appendChild(link)
      }
      setCssLoaded(true)
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
        label: string
        positionX: number
        positionY: number
        color: string
      }>
    ) => {
      setSaving(true)
      try {
        const savedNodes = await saveMindMap(entityType, entityId, nodesToSave)
        setNodes(savedNodes)
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-calm-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-calm-100 rounded-lg transition-colors text-calm-600"
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
          </button>
          <h2 className="text-lg font-semibold text-calm-800">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-calm-500">マインドマップ</span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-calm-50">
            <div className="text-calm-500">読み込み中...</div>
          </div>
        ) : (
          <MindMapEditor
            initialNodes={nodes}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </div>,
    document.body
  )
}
