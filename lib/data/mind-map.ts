import { prisma } from '@/lib/db'
import { MindMapNode, CreateMindMapNode, UpdateMindMapNode, EntityType } from '@/lib/types'

export async function getMindMapNodes(entityType: EntityType, entityId: string): Promise<MindMapNode[]> {
  const nodes = await prisma.mindMapNode.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'asc' },
  })

  return nodes as MindMapNode[]
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
    label: string
    positionX: number
    positionY: number
    color: string
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
          label: node.label,
          positionX: node.positionX,
          positionY: node.positionY,
          color: node.color,
        },
      })
      results.push(updated as MindMapNode)
    } else {
      // Create new
      const created = await prisma.mindMapNode.create({
        data: {
          entityType,
          entityId,
          parentId: node.parentId ?? null,
          label: node.label,
          positionX: node.positionX,
          positionY: node.positionY,
          color: node.color,
        },
      })
      results.push(created as MindMapNode)
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
