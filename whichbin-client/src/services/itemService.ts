import { apiFetch } from './apiClient'
import { isAbortError } from '../helpers/ErrorHelper'

export interface Item {
  id: number
  name: string
  recycleable: boolean
  information: string
  createdAt?: string
}

export const MOCK_ITEMS: Item[] = [
  {
    id: 1,
    name: 'Plastic Water Bottle',
    recycleable: true,
    information: 'Empty, rinse, and replace the cap before placing in the blue bin.',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Pizza Box (Greasy)',
    recycleable: false,
    information: 'Soiled cardboard cannot be recycled due to grease contamination. Dispose in regular trash.',
    createdAt: '2026-09-02T11:30:00Z',
  },
  {
    id: 3,
    name: 'Aluminum Soda Can',
    recycleable: true,
    information: 'Rinse lightly. Accepted in all curbside recycling containers.',
    createdAt: '2026-09-03T14:15:00Z',
  },
  {
    id: 4,
    name: 'Alkaline Batteries',
    recycleable: false,
    information: 'Single-use alkaline batteries belong in household trash or at designated hazardous drop-off centers.',
    createdAt: '2026-09-04T09:00:00Z',
  },
]

export async function fetchItems(
  searchText = '',
  recycleable?: boolean,
  signal?: AbortSignal
): Promise<Item[] | null> {
  const fallbackToMockItems = () =>
    MOCK_ITEMS.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchText.trim().toLowerCase())
      const matchesFilter =
        recycleable === undefined || item.recycleable === recycleable
      return matchesSearch && matchesFilter
    })

  try {
    const params = new URLSearchParams()
    if (searchText.trim()) {
      params.append('searchText', searchText.trim())
    }
    if (recycleable !== undefined) {
      params.append('recycleable', String(recycleable))
    }

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await apiFetch(`items${query}`, { signal })

    // Graceful fallback to mock data when backend endpoint isn't ready
    if (!response.ok) {
      return fallbackToMockItems()
    }

    const data = (await response.json()) as Item[]

    // Graceful fallback to mock data when the API responds with no items
    return data.length > 0 ? data : fallbackToMockItems()
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    return fallbackToMockItems()
  }
}

export async function fetchItemById(
  id: string | number,
  signal?: AbortSignal
): Promise<Item | null> {
  try {
    const response = await apiFetch(`items/${id}`, { signal })

    // Graceful fallback to mock data when backend endpoint isn't ready
    if (!response.ok) {
      return MOCK_ITEMS.find((item) => item.id === Number(id)) ?? null
    }

    return (await response.json()) as Item
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    return MOCK_ITEMS.find((item) => item.id === Number(id)) ?? null
  }
}
