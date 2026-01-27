'use client'

import { memo, useState, useCallback, useRef, useEffect, useContext, createContext } from 'react'
import { Handle, Position } from '@xyflow/react'
import { clsx } from 'clsx'

export interface MindMapNodeData extends Record<string, unknown> {
  label: string
  color: string
}

interface MindMapContextValue {
  onLabelChange: (nodeId: string, label: string) => void
  onColorChange: (nodeId: string, color: string) => void
  onDelete: (nodeId: string) => void
  onAddChild: (nodeId: string) => void
}

export const MindMapContext = createContext<MindMapContextValue | null>(null)

interface CustomNodeProps {
  id: string
  data: MindMapNodeData
  selected?: boolean
}

const NODE_COLORS = [
  { name: 'スレート', value: '#94a3b8' },
  { name: 'レッド', value: '#f87171' },
  { name: 'オレンジ', value: '#fb923c' },
  { name: 'イエロー', value: '#facc15' },
  { name: 'グリーン', value: '#4ade80' },
  { name: 'ブルー', value: '#60a5fa' },
  { name: 'パープル', value: '#a78bfa' },
  { name: 'ピンク', value: '#f472b6' },
]

function CustomNodeComponent({ id, data, selected }: CustomNodeProps) {
  const context = useContext(MindMapContext)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.label)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
      }
    }
    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showContextMenu])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValue(data.label)
    setIsEditing(true)
  }, [data.label])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (editValue.trim() && editValue !== data.label) {
      context?.onLabelChange(id, editValue.trim())
    } else {
      setEditValue(data.label)
    }
  }, [editValue, data.label, context, id])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(data.label)
      setIsEditing(false)
    }
  }, [handleBlur, data.label])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowContextMenu(true)
  }, [])

  return (
    <div
      className={clsx(
        'relative px-4 py-2 rounded-lg shadow-md min-w-[80px] text-center transition-all',
        selected && 'ring-2 ring-accent ring-offset-2'
      )}
      style={{ backgroundColor: data.color }}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-calm-400 !w-3 !h-3 !border-2 !border-white"
      />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-white text-center w-full outline-none font-medium"
          style={{ minWidth: '60px' }}
        />
      ) : (
        <span className="text-white font-medium select-none">{data.label}</span>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-calm-400 !w-3 !h-3 !border-2 !border-white"
      />

      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            context?.onAddChild(id)
          }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-accent/80 transition-colors shadow-md"
          title="子ノードを追加"
        >
          +
        </button>
      )}

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-calm-200 py-2 z-50 min-w-[140px]"
        >
          <div className="px-3 py-1 text-xs text-calm-500 font-medium">色を変更</div>
          <div className="px-2 py-1 flex flex-wrap gap-1">
            {NODE_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={(e) => {
                  e.stopPropagation()
                  context?.onColorChange(id, c.value)
                  setShowContextMenu(false)
                }}
                className={clsx(
                  'w-6 h-6 rounded-full border-2 transition-all',
                  c.value === data.color ? 'border-calm-800 scale-110' : 'border-white hover:scale-110'
                )}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
          <div className="border-t border-calm-200 mt-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                context?.onDelete(id)
                setShowContextMenu(false)
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const CustomNode = memo(CustomNodeComponent)
