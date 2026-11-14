import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import Announcements from './Announcements/Announcements'
import ItemSearch from './Item/ItemSearch'
import EducationalResources from './Resources/EducationalResources'
import AdminAnnouncements from './admin/AdminAnnouncements'
import AdminItems from './admin/AdminItems'
import AdminResources from './admin/AdminResources'
import AdminUsers from './admin/AdminUsers'
import { getAnnouncementsPaged, getAllAnnouncementsPaged } from '../services/announcementService'
import { fetchItems } from '../services/itemService'
import { getResources } from '../services/resourceService'
import { getPaginatedTriviaChallenges, getAllTriviaChallenges } from '../services/triviaService'
import { fetchUsers } from '../services/userService'

vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: { id: 1 }, logout: vi.fn() }) }))
vi.mock('../services/announcementService', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/announcementService')>(),
  getAnnouncementsPaged: vi.fn(), getAllAnnouncementsPaged: vi.fn(),
}))
vi.mock('../services/itemService', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/itemService')>(), fetchItems: vi.fn(),
}))
vi.mock('../services/resourceService', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/resourceService')>(), getResources: vi.fn(),
}))
vi.mock('../services/triviaService', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/triviaService')>(),
  getPaginatedTriviaChallenges: vi.fn(), getAllTriviaChallenges: vi.fn(),
}))
vi.mock('../services/userService', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/userService')>(), fetchUsers: vi.fn(),
}))

const emptyPage = { currentPage: 1, totalPages: 0, pageSize: 5, totalItems: 0, items: [] }
const paginatedCases = [
  { label: 'public announcements', Page: Announcements, fetch: vi.mocked(getAnnouncementsPaged), name: 'Announcements', navigationIndex: 0, pageArg: 0, throws: true },
  { label: 'admin announcements', Page: AdminAnnouncements, fetch: vi.mocked(getAllAnnouncementsPaged), name: 'Announcements', navigationIndex: 0, pageArg: 0, throws: true },
  { label: 'public items', Page: ItemSearch, fetch: vi.mocked(fetchItems), name: 'Items', navigationIndex: 0, pageArg: 3, throws: false },
  { label: 'admin items', Page: AdminItems, fetch: vi.mocked(fetchItems), name: 'Items', navigationIndex: 0, pageArg: 3, throws: false },
  { label: 'public resources', Page: EducationalResources, fetch: vi.mocked(getResources), name: 'Resources', navigationIndex: 0, pageArg: 0, throws: false },
  { label: 'admin resources', Page: AdminResources, fetch: vi.mocked(getResources), name: 'Resources', navigationIndex: 0, pageArg: 0, throws: false },
  { label: 'public trivia', Page: EducationalResources, fetch: vi.mocked(getPaginatedTriviaChallenges), name: 'Trivia challenges', navigationIndex: 1, pageArg: 0, throws: false },
  { label: 'admin trivia', Page: AdminResources, fetch: vi.mocked(getAllTriviaChallenges), name: 'Trivia challenges', navigationIndex: 1, pageArg: 0, throws: false },
]
const allCases = [...paginatedCases, { label: 'admin users', Page: AdminUsers, fetch: vi.mocked(fetchUsers), name: 'Users', throws: true }]
const errorText = (name: string) => `${name} could not be loaded. Check your connection and try again.`

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('scrollBy', vi.fn())
  vi.mocked(getAnnouncementsPaged).mockResolvedValue(emptyPage)
  vi.mocked(getAllAnnouncementsPaged).mockResolvedValue(emptyPage)
  vi.mocked(fetchItems).mockResolvedValue(emptyPage)
  vi.mocked(getResources).mockResolvedValue(emptyPage)
  vi.mocked(getPaginatedTriviaChallenges).mockResolvedValue(emptyPage)
  vi.mocked(getAllTriviaChallenges).mockResolvedValue(emptyPage)
  vi.mocked(fetchUsers).mockResolvedValue([])
})

describe.each(allCases)('$label collection failures', ({ Page, fetch, name, throws }) => {
  it('shows loading separately from an empty successful result', async () => {
    let resolveRequest: (value: never) => void = () => {}
    fetch.mockImplementationOnce(() => new Promise((resolve) => { resolveRequest = resolve }) as never)
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>)
    await waitFor(() => expect(container.querySelector('.collection-state--loading')).toBeInTheDocument())
    expect(screen.queryByText(errorText(name))).not.toBeInTheDocument()
    resolveRequest((name === 'Users' ? [] : emptyPage) as never)
    await screen.findByRole('heading', { name: `No ${name.toLowerCase()} found` })
    expect(container.querySelector('.collection-state--loading')).not.toBeInTheDocument()
  })

  it('shows a consistent failure, hides initial pagination, and retries successfully', async () => {
    if (throws) fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    else fetch.mockResolvedValueOnce(null as never)
    render(<MemoryRouter><Page /></MemoryRouter>)
    const message = await screen.findByText(errorText(name))
    const alert = message.closest('[role="alert"]')!
    expect(alert).toHaveClass('collection-error')
    const paginationCount = screen.queryAllByRole('navigation', { name: 'Pagination Navigation' }).length
    expect(paginationCount).toBe(name === 'Resources' || name === 'Trivia challenges' ? 1 : 0)
    const beforeRetry = fetch.mock.calls.length
    fireEvent.click(within(alert as HTMLElement).getByRole('button', { name: 'Try Again' }))
    await waitFor(() => expect(fetch.mock.calls.length).toBeGreaterThan(beforeRetry))
    await waitFor(() => expect(screen.queryByText(errorText(name))).not.toBeInTheDocument())
  })
})

describe.each(paginatedCases)('$label pagination failures', ({ Page, fetch, name, navigationIndex, pageArg, throws }) => {
  it('retains pagination and retries the failed page', async () => {
    fetch.mockResolvedValueOnce({ ...emptyPage, totalItems: 30, totalPages: 6 } as never)
    render(<MemoryRouter><Page /></MemoryRouter>)
    const navigations = await screen.findAllByRole('navigation', { name: 'Pagination Navigation' })
    // Wait for both independently fetched resource sections to settle.
    if (name === 'Resources' || name === 'Trivia challenges') {
      await waitFor(() => expect(screen.getAllByRole('navigation', { name: 'Pagination Navigation' })).toHaveLength(2))
    }
    const nav = (name === 'Resources' || name === 'Trivia challenges')
      ? screen.getAllByRole('navigation', { name: 'Pagination Navigation' })[navigationIndex]
      : navigations[0]
    if (throws) fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    else fetch.mockResolvedValueOnce(null as never)
    fireEvent.click(within(nav).getByRole('button', { name: 'Go to next page' }))
    const message = await screen.findByText(errorText(name))
    expect(nav).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'Go to page 2' })).toHaveAttribute('aria-current', 'page')
    fetch.mockResolvedValueOnce({ ...emptyPage, currentPage: 2, totalItems: 30, totalPages: 6 } as never)
    fireEvent.click(within(message.closest('[role="alert"]') as HTMLElement).getByRole('button', { name: 'Try Again' }))
    await waitFor(() => expect(screen.queryByText(errorText(name))).not.toBeInTheDocument())
    expect(fetch.mock.lastCall?.[pageArg]).toBe(2)
  })
})
