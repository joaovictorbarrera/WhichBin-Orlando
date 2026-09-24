import { apiFetch } from './apiClient'

export type Announcement = {
  id: number
  title: string
  message: string
  type: string
  startDate: string
  endDate: string | null
  active: boolean
}

export async function getAnnouncements(): Promise<Announcement[] | null> {
  try {
    const response = await apiFetch('announcements')

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Announcement[]
  } catch {
    return null
  }
}

export async function getAnnouncementById(
  announcementId: string
): Promise<Announcement | null> {
  try {
    const response = await apiFetch(`announcements/${announcementId}`)

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Announcement
  } catch {
    return null
  }
}
