import { apiFetch } from './apiClient'

export const announcementTypes = [
  { value: 'GENERAL', label: 'General' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'SCHEDULE_CHANGE', label: 'Schedule Change' },
  { value: 'SERVICE_ALERT', label: 'Service Alert' },
  { value: 'RECYCLING_CHANGE', label: 'Recycling Change' },
] as const

export type AnnouncementType = (typeof announcementTypes)[number]['value']

export type Announcement = {
  id: number
  title: string
  message: string
  type: string
  startDate: string
  endDate: string | null
  active: boolean
}

export async function getAnnouncements(
  type?: AnnouncementType
): Promise<Announcement[] | null> {
  try {
    const query = type ? `?type=${encodeURIComponent(type)}` : ''
    const response = await apiFetch(`announcements${query}`)

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Announcement[]
  } catch {
    return null
  }
}

export async function getAllAnnouncements(
  type?: AnnouncementType
): Promise<Announcement[] | null> {
  try {
    const query = type ? `?type=${encodeURIComponent(type)}` : ''
    const response = await apiFetch(`announcements/all${query}`)

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

export type AnnouncementInput = {
  title: string
  message: string
  type: string
  startDate: string
  endDate: string | null
  active: boolean
}

export async function createAnnouncement(
  announcement: AnnouncementInput
): Promise<Announcement | null> {
  try {
    const response = await apiFetch('announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(announcement),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Announcement
  } catch {
    return null
  }
}

export async function updateAnnouncement(
  announcementId: number,
  announcement: AnnouncementInput
): Promise<Announcement | null> {
  try {
    const response = await apiFetch(`announcements/${announcementId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(announcement),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as Announcement
  } catch {
    return null
  }
}

export async function deleteAnnouncement(
  announcementId: number
): Promise<boolean> {
  try {
    const response = await apiFetch(`announcements/${announcementId}`, {
      method: 'DELETE',
    })

    return response.ok
  } catch {
    return false
  }
}
