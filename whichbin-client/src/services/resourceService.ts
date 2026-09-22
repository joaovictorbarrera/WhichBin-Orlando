import { API_URL } from '../api/config'

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
  sections: ResourceSection[]
}

export async function getResourceById(resourceId: string): Promise<Resource | null> {
  try {
    const response = await fetch(`${API_URL}resources/${resourceId}`)

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Resource
  } catch {
    return null
  }
}
