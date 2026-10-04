import { apiFetch } from './apiClient'

export type ResourceSection = {
  heading: string
  styleType: string
  items: string
}

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

export async function getResources(): Promise<Resource[] | null> {
  try {
    const response = await apiFetch('resources')

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Resource[]
  } catch {
    return null
  }
}

export async function getResourceById(resourceId: string): Promise<Resource | null> {
  try {
    const response = await apiFetch(`resources/${resourceId}`)

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Resource
  } catch {
    return null
  }
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