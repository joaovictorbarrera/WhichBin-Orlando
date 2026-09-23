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
