import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAnnouncementById } from './announcementService'
import { fetchItemById } from './itemService'
import { getResourceById } from './resourceService'
import { getTriviaChallengeById } from './triviaService'

const detailRequests = [
  { feature: 'item', request: () => fetchItemById(1) },
  { feature: 'resource', request: () => getResourceById('1') },
  { feature: 'announcement', request: () => getAnnouncementById('1') },
  { feature: 'challenge', request: () => getTriviaChallengeById(1) },
]

describe.each(detailRequests)('$feature detail API', ({ request }) => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each([404, 503])('preserves HTTP %i status', async (status) => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status }))

    await expect(request()).rejects.toMatchObject({ statusCode: status })
  })

  it('propagates network errors', async () => {
    const networkError = new Error('network error')
    vi.mocked(fetch).mockRejectedValue(networkError)

    await expect(request()).rejects.toBe(networkError)
  })
})
