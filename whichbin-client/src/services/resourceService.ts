
import { apiFetch } from './apiClient'
import { ApiResponseError } from '../helpers/ErrorHelper'
import type { PaginatedResponse } from '../types/PaginatedResponse'

export type ResourceSection = {
  heading: string
  styleType: string
  items: string
}

// Lightweight resource data used by the public list.
export type ResourceListItem = {
  id: number
  title: string
  description: string
  styleType: string
}

// Full resource data used by admin and detail pages.
export type Resource = {
  id: number
  title: string
  description: string
  content: string
  styleType: string
  pdfUrl?: string | null
  sections?: ResourceSection[]
}

export type CreateResourceRequest = {
  title: string
  description: string
  content: string
  styleType: string
  pdfUrl?: string | null
  sections?: ResourceSection[]
}

// Public list: returns lightweight resources with pagination.
export async function getResources(
  page: number,
  pageSize: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<ResourceListItem> | null> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })

    const response = await apiFetch(`resources?${params.toString()}`, {
      signal,
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as PaginatedResponse<ResourceListItem>
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    return null
  }
}

// Admin list: returns full resources with pagination.
export async function getAdminResources(
  page: number,
  pageSize: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<Resource> | null> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })

    const response = await apiFetch(`resources/all?${params.toString()}`, {
      signal,
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as PaginatedResponse<Resource>
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    return null
  }
}

export async function getResourceById(resourceId: string): Promise<Resource> {
  const response = await apiFetch(`resources/${resourceId}`)

  if (!response.ok) {
    throw new ApiResponseError(
      response.status,
      `Failed to load resource details (${response.status})`
    )
  }

  return (await response.json()) as Resource
}

export async function createResource(
  resource: CreateResourceRequest
): Promise<Resource | null> {
  try {
    const response = await apiFetch('resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Resource
  } catch {
    return null
  }
}

export async function updateResource(
  resourceId: number,
  resource: CreateResourceRequest
): Promise<Resource | null> {
  try {
    const response = await apiFetch(`resources/${resourceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Resource
  } catch {
    return null
  }
}

export async function deleteResource(resourceId: number): Promise<boolean> {
  try {
    const response = await apiFetch(`resources/${resourceId}`, {
      method: 'DELETE',
    })

    return response.ok
  } catch {
    return false
  }
}
