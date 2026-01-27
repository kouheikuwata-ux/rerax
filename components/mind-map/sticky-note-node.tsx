'use client'

import { memo, useState, useCallback, useRef, useEffect, useContext } from 'react'
import { NodeResizer } from '@xyflow/react'
import { clsx } from 'clsx'
import { MindMapContext } from './custom-node'

export interface StickyNoteData extends Record<string, unknown> {
  label: string
  color: string
  width?: number
  height?: number
}

interface StickyNoteNodeProps {
  id: string
  data: StickyNoteData
  selected?: boolean
}

const STICKY_COLORS = [
  { name: 'イエロー', value: '#FFF9C4', textColor: '#5D4037' },
  { name: 'ピンク', value: '#FCE4EC', textColor: '#880E4F' },
  { name: 'グリーン', value: '#E8F5E9', textColor: '#1B5E20' },
  { name: 'ブルー', value: '#E3F2FD', textColor: '#0D47A1' },
  { name: 'オレンジ', value: '#FFF3E0', textColor: '#E65100' },
  { name: 'パープル', value: '#F3E5F5', textColor: '#4A148C' },
]

function StickyNoteNodeComponent({ id, data, selected }: StickyNoteNodeProps) {
  const context = useContext(MindMapContext)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.label)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const colorConfig = STICKY_COLORS.find(c => c.value === data.color) || STICKY_COLORS[0]

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValue(data.label)
    setIsEditing(true)
  }, [data.label])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (editValue !== data.label) {
      context?.onLabelChange(id, editValue)
    }
  }, [editValue, data.label, context, id])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(data.label)
      setIsEditing(false)
    }
    // Allow Enter for new lines in sticky notes
  }, [data.label])

  return (
    <>
      <NodeResizer
        minWidth={80}
        minHeight={80}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-3 !h-3 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />
      <div
        className={clsx(
          'w-full h-full rounded shadow-md flex flex-col transition-all cursor-pointer',
          selected && 'ring-2 ring-blue-500'
        )}
        style={{
          backgroundColor: data.color || STICKY_COLORS[0].value,
          minWidth: data.width || 120,
          minHeight: data.height || 120,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Content */}
        <div className="flex-1 p-3 overflow-hidden">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-transparent outline-none resize-none text-sm font-medium"
              style={{ color: colorConfig.textColor }}
              placeholder="テキストを入力..."
            />
          ) : (
            <div
              className="w-full h-full text-sm font-medium whitespace-pre-wrap break-words select-none"
              style={{ color: colorConfig.textColor }}
            >
              {data.label || 'ダブルクリックで編集'}
            </div>
          )}
        </div>

        {/* Toolbar when selected */}
        {selected && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-calm-200 p-1">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowColorPicker(!showColorPicker)
                }}
                className="w-6 h-6 rounded border-2 border-calm-300 hover:border-calm-400 transition-colors"
                style={{ backgroundColor: data.color || STICKY_COLORS[0].value }}
                title="色を変更"
              />
              {showColorPicker && (
                <div
                  ref={colorPickerRef}
                  className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-calm-200 p-2 z-50 flex gap-1"
                >
                  {STICKY_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        context?.onColorChange(id, c.value)
                        setShowColorPicker(false)
                      }}
                      className={clsx(
                        'w-6 h-6 rounded border-2 transition-all',
                        c.value === data.color ? 'border-calm-800 scale-110' : 'border-calm-300 hover:scale-110'
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                context?.onDelete(id)
              }}
              className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-colors"
              title="削除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export const StickyNoteNode = memo(StickyNoteNodeComponent)
