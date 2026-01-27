'use client'

import { memo, useState, useRef, useContext } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { MindMapContext } from './custom-node'

export interface ImageNodeData extends Record<string, unknown> {
  label: string
  color: string
  width?: number
  height?: number
  imageUrl?: string | null
}

interface ImageNodeProps {
  id: string
  data: ImageNodeData
  selected?: boolean
}

function ImageNodeComponent({ id, data, selected }: ImageNodeProps) {
  const context = useContext(MindMapContext)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    if (!data.imageUrl) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('画像サイズは1MB以下にしてください')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      context?.onImageChange?.(id, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    context?.onImageChange?.(id, null)
  }

  const width = data.width || 200
  const height = data.height || 150

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={80}
        handleStyle={{ width: 8, height: 8 }}
      />
      <Handle type="target" position={Position.Top} className="!bg-calm-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-calm-400" />

      <div
        className="relative rounded-lg overflow-hidden shadow-md border-2 transition-all"
        style={{
          width,
          height,
          borderColor: selected ? '#3b82f6' : '#e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        {data.imageUrl ? (
          <>
            <img
              src={data.imageUrl}
              alt={data.label || '画像'}
              className="w-full h-full object-cover"
            />
            {selected && (
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm transition-colors"
                  title="画像を変更"
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-md shadow-sm transition-colors"
                  title="画像を削除"
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
            {data.label && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                {data.label}
              </div>
            )}
          </>
        ) : (
          <div
            onClick={handleImageClick}
            className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-calm-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-calm-400"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-calm-500 text-sm">クリックして画像を追加</span>
          </div>
        )}

        {/* Delete button when selected */}
        {selected && (
          <button
            onClick={() => context?.onDelete(id)}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 p-1.5 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition-colors"
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
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}

export const ImageNode = memo(ImageNodeComponent)
