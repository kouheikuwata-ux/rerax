import { prisma } from '@/lib/db'
import { MindMapNode, CreateMindMapNode, UpdateMindMapNode, EntityType, MindMapNodeType } from '@/lib/types'

export async function getMindMapNodes(entityType: EntityType, entityId: string): Promise<MindMapNode[]> {
  const nodes = await prisma.mindMapNode.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'asc' },
  })

  return nodes.map(node => ({
    ...node,
    nodeType: (node.nodeType || 'mindMapNode') as MindMapNodeType,
  })) as MindMapNode[]
}

export async function createMindMapNode(data: CreateMindMapNode): Promise<MindMapNode> {
  const node = await prisma.mindMapNode.create({
    data: {
      entityType: data.entityType,
      entityId: data.entityId,
      parentId: data.parentId ?? null,
      label: data.label,
      positionX: data.positionX,
      positionY: data.positionY,
      color: data.color ?? '#94a3b8',
    },
  })

  return node as MindMapNode
}

export async function updateMindMapNode(
  nodeId: string,
  data: UpdateMindMapNode
): Promise<MindMapNode> {
  const node = await prisma.mindMapNode.update({
    where: { id: nodeId },
    data: {
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.label !== undefined && { label: data.label }),
      ...(data.positionX !== undefined && { positionX: data.positionX }),
      ...(data.positionY !== undefined && { positionY: data.positionY }),
      ...(data.color !== undefined && { color: data.color }),
    },
  })

  return node as MindMapNode
}

export async function deleteMindMapNode(nodeId: string): Promise<void> {
  await prisma.mindMapNode.delete({
    where: { id: nodeId },
  })
}

export async function saveMindMapNodes(
  entityType: EntityType,
  entityId: string,
  nodes: Array<{
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
): Promise<MindMapNode[]> {
  // Get existing node IDs
  const existingNodes = await prisma.mindMapNode.findMany({
    where: { entityType, entityId },
    select: { id: true },
  })
  const existingIds = new Set(existingNodes.map((n) => n.id))

  // Separate nodes into create, update, and delete operations
  const incomingIds = new Set(nodes.filter((n) => n.id).map((n) => n.id!))
  const idsToDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id))

  // Delete removed nodes
  if (idsToDelete.length > 0) {
    await prisma.mindMapNode.deleteMany({
      where: { id: { in: idsToDelete } },
    })
  }

  // Upsert nodes
  const results: MindMapNode[] = []
  for (const node of nodes) {
    if (node.id && existingIds.has(node.id)) {
      // Update existing
      const updated = await prisma.mindMapNode.update({
        where: { id: node.id },
        data: {
          parentId: node.parentId ?? null,
          nodeType: node.nodeType ?? 'mindMapNode',
          label: node.label,
          positionX: node.positionX,
          positionY: node.positionY,
          width: node.width ?? null,
          height: node.height ?? null,
          color: node.color,
          imageUrl: node.imageUrl ?? null,
        },
      })
      results.push({
        ...updated,
        nodeType: (updated.nodeType || 'mindMapNode') as MindMapNodeType,
      } as MindMapNode)
    } else {
      // Create new
      const created = await prisma.mindMapNode.create({
        data: {
          entityType,
          entityId,
          parentId: node.parentId ?? null,
          nodeType: node.nodeType ?? 'mindMapNode',
          label: node.label,
          positionX: node.positionX,
          positionY: node.positionY,
          width: node.width ?? null,
          height: node.height ?? null,
          color: node.color,
          imageUrl: node.imageUrl ?? null,
        },
      })
      results.push({
        ...created,
        nodeType: (created.nodeType || 'mindMapNode') as MindMapNodeType,
      } as MindMapNode)
    }
  }

  return results
}

export async function deleteMindMapNodesByEntity(
  entityType: EntityType,
  entityId: string
): Promise<void> {
  await prisma.mindMapNode.deleteMany({
    where: { entityType, entityId },
  })
}
