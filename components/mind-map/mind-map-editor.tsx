'use client'

import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeChange,
  ReactFlowProvider,
} from '@xyflow/react'
import { CustomNode, MindMapNodeData, MindMapContext } from './custom-node'
import { StickyNoteNode, StickyNoteData } from './sticky-note-node'
import { SectionNode, SectionNodeData } from './section-node'
import { ImageNode, ImageNodeData } from './image-node'
import { MindMapNode } from '@/lib/types'

type FlowNodeData = MindMapNodeData | StickyNoteData | SectionNodeData | ImageNodeData
type FlowNode = Node<FlowNodeData>

const nodeTypes = {
  mindMapNode: CustomNode,
  stickyNote: StickyNoteNode,
  section: SectionNode,
  image: ImageNode,
}

interface MindMapEditorProps {
  initialNodes: MindMapNode[]
  onSave: (nodes: Array<{
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
  }>) => Promise<MindMapNode[]>
  saving: boolean
}

function generateId() {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function MindMapEditorInner({ initialNodes, onSave, saving }: MindMapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [hasChanges, setHasChanges] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Convert database nodes to React Flow format
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const flowNodes: FlowNode[] = initialNodes.map((node) => ({
      id: node.id,
      type: node.nodeType || 'mindMapNode',
      position: { x: node.positionX, y: node.positionY },
      ...(node.width && node.height ? { width: node.width, height: node.height } : {}),
      ...(node.nodeType === 'section' ? { zIndex: -1000 } : {}),
      data: {
        label: node.label,
        color: node.color,
        width: node.width,
        height: node.height,
        imageUrl: node.imageUrl,
      },
    }))

    const flowEdges: Edge[] = initialNodes
      .filter((node) => node.parentId)
      .map((node) => ({
        id: `edge_${node.parentId}_${node.id}`,
        source: node.parentId!,
        target: node.id,
        type: 'smoothstep',
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [initialNodes, setNodes, setEdges])

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChanges) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave()
    }, 1500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [hasChanges, nodes, edges])

  const markChanged = useCallback(() => {
    setHasChanges(true)
  }, [])

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      onNodesChange(changes)
      // Mark as changed for position changes (dragging) or dimension changes (resizing)
      const hasDragChange = changes.some(
        (change) => change.type === 'position' && change.dragging === false
      )
      const dimensionChanges = changes.filter(
        (change): change is NodeChange<FlowNode> & { type: 'dimensions'; id: string; dimensions?: { width: number; height: number } } =>
          change.type === 'dimensions' && 'dimensions' in change && change.dimensions !== undefined
      )

      // Update node data with new dimensions
      if (dimensionChanges.length > 0) {
        setNodes((nds) =>
          nds.map((node) => {
            const dimChange = dimensionChanges.find((c) => c.id === node.id)
            if (dimChange && dimChange.dimensions) {
              return {
                ...node,
                width: dimChange.dimensions.width,
                height: dimChange.dimensions.height,
                data: {
                  ...node.data,
                  width: dimChange.dimensions.width,
                  height: dimChange.dimensions.height,
                },
              }
            }
            return node
          })
        )
        markChanged()
      }

      if (hasDragChange) {
        markChanged()
      }
    },
    [onNodesChange, markChanged, setNodes]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      // Remove existing edge to the target (only one parent allowed)
      setEdges((eds) => eds.filter((e) => e.target !== connection.target))
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          },
          eds
        )
      )
      markChanged()
    },
    [setEdges, markChanged]
  )

  const handleLabelChange = useCallback(
    (nodeId: string, label: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label } }
            : node
        )
      )
      markChanged()
    },
    [setNodes, markChanged]
  )

  const handleColorChange = useCallback(
    (nodeId: string, color: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, color } }
            : node
        )
      )
      markChanged()
    },
    [setNodes, markChanged]
  )

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      // Delete node and all its descendants
      const getDescendantIds = (id: string): string[] => {
        const childEdges = edges.filter((e) => e.source === id)
        const childIds = childEdges.map((e) => e.target)
        return [id, ...childIds.flatMap(getDescendantIds)]
      }

      const idsToDelete = new Set(getDescendantIds(nodeId))

      setNodes((nds) => nds.filter((n) => !idsToDelete.has(n.id)))
      setEdges((eds) => eds.filter((e) => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)))
      markChanged()
    },
    [edges, setNodes, setEdges, markChanged]
  )

  const handleAddChild = useCallback(
    (parentId: string) => {
      setNodes((nds) => {
        const parentNode = nds.find((n) => n.id === parentId)
        if (!parentNode) return nds

        const newId = generateId()
        const newNode: FlowNode = {
          id: newId,
          type: 'mindMapNode',
          position: {
            x: parentNode.position.x,
            y: parentNode.position.y + 100,
          },
          data: {
            label: '新しいノード',
            color: '#94a3b8',
          },
        }

        const newEdge: Edge = {
          id: `edge_${parentId}_${newId}`,
          source: parentId,
          target: newId,
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }

        setEdges((eds) => [...eds, newEdge])
        markChanged()

        return [...nds, newNode]
      })
    },
    [setNodes, setEdges, markChanged]
  )

  const handleAddRootNode = useCallback(() => {
    const newId = generateId()
    const newNode: FlowNode = {
      id: newId,
      type: 'mindMapNode',
      position: { x: 250, y: 50 },
      data: {
        label: '新しいノード',
        color: '#94a3b8',
      },
    }

    setNodes((nds) => [...nds, newNode])
    markChanged()
  }, [setNodes, markChanged])

  const handleAddStickyNote = useCallback(() => {
    const newId = generateId()
    const newNode: FlowNode = {
      id: newId,
      type: 'stickyNote',
      position: { x: 100, y: 100 },
      data: {
        label: '',
        color: '#FFF9C4',
        width: 120,
        height: 120,
      },
    }

    setNodes((nds) => [...nds, newNode])
    markChanged()
  }, [setNodes, markChanged])

  const handleAddSection = useCallback(() => {
    const newId = generateId()
    const newNode: FlowNode = {
      id: newId,
      type: 'section',
      position: { x: 50, y: 50 },
      zIndex: -1000,
      data: {
        label: 'セクション',
        color: '#F5F5F5',
        width: 300,
        height: 200,
      },
    }

    setNodes((nds) => [...nds, newNode])
    markChanged()
  }, [setNodes, markChanged])

  const handleAddImage = useCallback(() => {
    const newId = generateId()
    const newNode: FlowNode = {
      id: newId,
      type: 'image',
      position: { x: 150, y: 100 },
      data: {
        label: '',
        color: '#f9fafb',
        width: 200,
        height: 150,
        imageUrl: null,
      },
    }

    setNodes((nds) => [...nds, newNode])
    markChanged()
  }, [setNodes, markChanged])

  const handleImageChange = useCallback(
    (nodeId: string, imageUrl: string | null) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, imageUrl } }
            : node
        )
      )
      markChanged()
    },
    [setNodes, markChanged]
  )

  const handleSave = useCallback(async () => {
    // Build parentId map from edges
    const parentMap = new Map<string, string>()
    edges.forEach((edge) => {
      parentMap.set(edge.target, edge.source)
    })

    const nodesToSave = nodes.map((node) => ({
      id: node.id.startsWith('temp_') ? undefined : node.id,
      parentId: parentMap.get(node.id) ?? null,
      nodeType: node.type,
      label: node.data.label || '',
      positionX: node.position.x,
      positionY: node.position.y,
      width: node.measured?.width ?? node.width ?? (node.data as StickyNoteData | SectionNodeData | ImageNodeData).width ?? null,
      height: node.measured?.height ?? node.height ?? (node.data as StickyNoteData | SectionNodeData | ImageNodeData).height ?? null,
      color: node.data.color,
      imageUrl: (node.data as ImageNodeData).imageUrl ?? null,
    }))

    const savedNodes = await onSave(nodesToSave)

    // Update local state with real IDs from server
    // Map old temp IDs to new real IDs based on position order
    const oldIds = nodes.map(n => n.id)
    const newIds = savedNodes.map(n => n.id)
    const idMap = new Map<string, string>()
    oldIds.forEach((oldId, index) => {
      if (oldId.startsWith('temp_') && newIds[index]) {
        idMap.set(oldId, newIds[index])
      }
    })

    // Update nodes with new IDs
    if (idMap.size > 0) {
      setNodes(nds => nds.map(node => {
        const newId = idMap.get(node.id)
        return newId ? { ...node, id: newId } : node
      }))

      // Update edges with new IDs
      setEdges(eds => eds.map(edge => ({
        ...edge,
        id: `edge_${idMap.get(edge.source) ?? edge.source}_${idMap.get(edge.target) ?? edge.target}`,
        source: idMap.get(edge.source) ?? edge.source,
        target: idMap.get(edge.target) ?? edge.target,
      })))
    }

    setHasChanges(false)
  }, [nodes, edges, onSave, setNodes, setEdges])

  const contextValue = useMemo(
    () => ({
      onLabelChange: handleLabelChange,
      onColorChange: handleColorChange,
      onDelete: handleDeleteNode,
      onAddChild: handleAddChild,
      onImageChange: handleImageChange,
    }),
    [handleLabelChange, handleColorChange, handleDeleteNode, handleAddChild, handleImageChange]
  )

  return (
    <MindMapContext.Provider value={contextValue}>
      <div className="w-full h-full relative">
        <ReactFlow
        nodes={nodes as Node[]}
        edges={edges}
        onNodesChange={handleNodesChange as (changes: NodeChange[]) => void}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeDoubleClick={(e) => e.stopPropagation()}
        onPaneClick={(e) => e.stopPropagation()}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-calm-50"
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls className="bg-white border border-calm-200 rounded-lg shadow-md" />
        <MiniMap
          nodeColor={(node) => (node.data as MindMapNodeData).color}
          className="bg-white border border-calm-200 rounded-lg shadow-md"
        />
      </ReactFlow>

      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={handleAddRootNode}
          className="px-3 py-2 bg-calm-600 text-white rounded-lg hover:bg-calm-700 transition-colors shadow-md flex items-center gap-2 text-sm"
          title="マインドマップノードを追加"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="5" r="2" />
            <path d="M12 9V5.5" />
            <path d="M14.5 10.5 17 7" />
            <path d="M9.5 10.5 7 7" />
          </svg>
          ノード
        </button>
        <button
          onClick={handleAddStickyNote}
          className="px-3 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors shadow-md flex items-center gap-2 text-sm"
          title="付箋を追加"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
            <path d="M15 3v4a2 2 0 0 0 2 2h4" />
          </svg>
          付箋
        </button>
        <button
          onClick={handleAddSection}
          className="px-3 py-2 bg-white text-calm-700 border border-calm-300 rounded-lg hover:bg-calm-50 transition-colors shadow-md flex items-center gap-2 text-sm"
          title="セクションを追加"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
          </svg>
          セクション
        </button>
        <button
          onClick={handleAddImage}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md flex items-center gap-2 text-sm"
          title="画像を追加"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          画像
        </button>
      </div>

      <div className="absolute top-4 right-4">
        {saving ? (
          <span className="px-3 py-1.5 bg-calm-100 text-calm-600 rounded-full text-sm">
            保存中...
          </span>
        ) : hasChanges ? (
          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            未保存の変更
          </span>
        ) : (
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
            保存済み
          </span>
        )}
        </div>
      </div>
    </MindMapContext.Provider>
  )
}

export function MindMapEditor(props: MindMapEditorProps) {
  return (
    <ReactFlowProvider>
      <MindMapEditorInner {...props} />
    </ReactFlowProvider>
  )
}
