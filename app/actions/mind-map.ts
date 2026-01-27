'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  getMindMapNodes,
  createMindMapNode,
  updateMindMapNode,
  deleteMindMapNode,
  saveMindMapNodes,
} from '@/lib/data/mind-map'
import { MindMapNode, CreateMindMapNode, UpdateMindMapNode, EntityType } from '@/lib/types'

export async function getMindMap(entityType: EntityType, entityId: string): Promise<MindMapNode[]> {
  await requireAuth()
  return getMindMapNodes(entityType, entityId)
}

export async function addMindMapNode(data: CreateMindMapNode): Promise<MindMapNode> {
  await requireAuth()
  const node = await createMindMapNode(data)
  revalidatePath('/')
  return node
}

export async function editMindMapNode(
  nodeId: string,
  data: UpdateMindMapNode
): Promise<MindMapNode> {
  await requireAuth()
  const node = await updateMindMapNode(nodeId, data)
  revalidatePath('/')
  return node
}

export async function removeMindMapNode(nodeId: string): Promise<void> {
  await requireAuth()
  await deleteMindMapNode(nodeId)
  revalidatePath('/')
}

export async function saveMindMap(
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
  await requireAuth()
  const result = await saveMindMapNodes(entityType, entityId, nodes)
  revalidatePath('/')
  return result
}
