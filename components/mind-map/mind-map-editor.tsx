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
import { MindMapNode } from '@/lib/types'

type FlowNode = Node<MindMapNodeData>

const nodeTypes = {
  mindMapNode: CustomNode,
}

interface MindMapEditorProps {
  initialNodes: MindMapNode[]
  onSave: (nodes: Array<{
    id?: string
    parentId?: string | null
    label: string
    positionX: number
    positionY: number
    color: string
  }>) => Promise<void>
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
      type: 'mindMapNode',
      position: { x: node.positionX, y: node.positionY },
      data: {
        label: node.label,
        color: node.color,
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
      // Only mark as changed for position changes (dragging)
      const hasDragChange = changes.some(
        (change) => change.type === 'position' && change.dragging === false
      )
      if (hasDragChange) {
        markChanged()
      }
    },
    [onNodesChange, markChanged]
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

  const handleSave = useCallback(async () => {
    // Build parentId map from edges
    const parentMap = new Map<string, string>()
    edges.forEach((edge) => {
      parentMap.set(edge.target, edge.source)
    })

    const nodesToSave = nodes.map((node) => ({
      id: node.id.startsWith('temp_') ? undefined : node.id,
      parentId: parentMap.get(node.id) ?? null,
      label: node.data.label,
      positionX: node.position.x,
      positionY: node.position.y,
      color: node.data.color,
    }))

    await onSave(nodesToSave)
    setHasChanges(false)
  }, [nodes, edges, onSave])

  const contextValue = useMemo(
    () => ({
      onLabelChange: handleLabelChange,
      onColorChange: handleColorChange,
      onDelete: handleDeleteNode,
      onAddChild: handleAddChild,
    }),
    [handleLabelChange, handleColorChange, handleDeleteNode, handleAddChild]
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
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shadow-md flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          ノード追加
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
