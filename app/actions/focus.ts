'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  createFocusItem,
  updateFocusItem,
  deleteFocusItem,
  markFocusItemDone,
  markFocusItemSkipped,
} from '@/lib/data/focus-items'
import { CreateFocusItem, UpdateFocusItem, FocusItem } from '@/lib/types'

export async function addFocusItem(data: CreateFocusItem): Promise<FocusItem> {
  const userId = await requireAuth()
  const item = await createFocusItem(userId, data)
  revalidatePath('/')
  return item
}

export async function editFocusItem(
  itemId: string,
  data: UpdateFocusItem
): Promise<FocusItem> {
  const userId = await requireAuth()
  const item = await updateFocusItem(userId, itemId, data)
  revalidatePath('/')
  return item
}

export async function removeFocusItem(itemId: string): Promise<void> {
  const userId = await requireAuth()
  await deleteFocusItem(userId, itemId)
  revalidatePath('/')
}

export async function completeFocusItem(itemId: string): Promise<FocusItem> {
  const userId = await requireAuth()
  const item = await markFocusItemDone(userId, itemId)
  revalidatePath('/')
  return item
}

export async function skipFocusItem(itemId: string): Promise<FocusItem> {
  const userId = await requireAuth()
  const item = await markFocusItemSkipped(userId, itemId)
  revalidatePath('/')
  return item
}
