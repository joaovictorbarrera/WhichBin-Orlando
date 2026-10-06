import { apiFetch } from './apiClient'
import { isAbortError } from '../helpers/ErrorHelper'

export interface Item {
  id: number
  name: string
  recyclable: boolean
  largeItem: boolean
  information: string
  keywords?: string[]
  createdAt?: string
}

export interface ItemInput {
  name: string
  recyclable: boolean
  largeItem?: boolean
  information: string
  keywords?: string[]
}

export async function fetchItems(
  searchText = '',
  recyclable?: boolean,
  signal?: AbortSignal
): Promise<Item[] | null> {
  try {
    const params = new URLSearchParams()
    if (searchText.trim()) {
      params.append('searchText', searchText.trim())
    }
    if (recyclable !== undefined) {
      params.append('recyclable', String(recyclable))
    }

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await apiFetch(`items${query}`, { signal })
    if (!response.ok) {
      return null
    }

    return (await response.json()) as Item[]
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    return null
  }
}

export async function fetchItemById(
  id: string | number,
  signal?: AbortSignal
): Promise<Item | null> {
  try {
    const response = await apiFetch(`items/${id}`, { signal })
    if (!response.ok) {
      return null
    }

    return (await response.json()) as Item
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    return null
  }
}

export async function createItem(item: ItemInput): Promise<Item | null> {
  try {
    const response = await apiFetch('items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Item
  } catch {
    return null
  }
}

export async function updateItem(
  id: number,
  item: ItemInput
): Promise<Item | null> {
  try {
    const response = await apiFetch(`items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Item
  } catch {
    return null
  }
}

export async function deleteItem(id: number): Promise<boolean> {
  try {
    const response = await apiFetch(`items/${id}`, {
      method: 'DELETE',
    })

    return response.ok
  } catch {
    return false
  }
}
