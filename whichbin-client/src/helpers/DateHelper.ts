/**
 * Formats an ISO date/timestamp string into a human-readable US English format.
 * Example: '2026-09-01T10:00:00Z' -> 'September 1, 2026 at 6:00 AM'
 */
export function formatDateTime(dateTime?: string | null): string {
  if (!dateTime) {
    return ''
  }

  try {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return ''
  }
}

