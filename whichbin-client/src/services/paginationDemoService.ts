import { apiFetch } from './apiClient'

export interface DemoItem {
  id: number
  name: string
  category: string
  bin: 'Recycling' | 'Trash'
}

export interface PaginatedResponse<T> {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  items: T[]
}

export type BinFilter = 'All' | DemoItem['bin']

export async function fetchDemoItems(
  page: number,
  pageSize: number,
  filter: BinFilter,
  signal?: AbortSignal
): Promise<PaginatedResponse<DemoItem>> {
  const params = new URLSearchParams({
    filter,
    page: String(page),
    pageSize: String(pageSize),
  })
  const response = await apiFetch(`demo/items?${params}`, { signal })

  if (!response.ok) {
    throw new Error(`Failed to load demo items (${response.status})`)
  }

  return (await response.json()) as PaginatedResponse<DemoItem>
}
