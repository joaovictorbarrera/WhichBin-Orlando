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
  vi.mocked(fetchUsers).mockResolvedValue(emptyPage)
})

describe.each(allCases)('$label collection failures', ({ Page, fetch, name, throws }) => {
  it('shows loading separately from an empty successful result', async () => {
    let resolveRequest: (value: never) => void = () => {}
    fetch.mockImplementationOnce(() => new Promise((resolve) => { resolveRequest = resolve }) as never)
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>)
    await waitFor(() => expect(container.querySelector('.collection-state--loading')).toBeInTheDocument())
    expect(screen.queryByText(errorText(name))).not.toBeInTheDocument()
    resolveRequest(emptyPage as never)
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

describe('admin users pagination', () => {
  it('requests the selected page and page size', async () => {
    vi.mocked(fetchUsers).mockImplementation(async (page, pageSize) => ({
      currentPage: page,
      totalPages: Math.ceil(6 / pageSize),
      pageSize,
      totalItems: 6,
      items: [{
        id: page,
        firstName: 'Page',
        lastName: String(page),
        email: `page${page}@example.com`,
        createdAt: '',
        updatedAt: '',
      }],
    }))

    render(<MemoryRouter><AdminUsers /></MemoryRouter>)

    const pagination = await screen.findByRole('navigation', { name: 'Pagination Navigation' })
    expect(await screen.findByText('page1@example.com')).toBeInTheDocument()

    fireEvent.click(within(pagination).getByRole('button', { name: 'Go to next page' }))
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(2, 5, expect.any(AbortSignal))
    })
    expect(await screen.findByText('page2@example.com')).toBeInTheDocument()

    fireEvent.change(within(pagination).getByRole('combobox', { name: 'Select page size' }), {
      target: { value: '10' },
    })
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(1, 10, expect.any(AbortSignal))
    })
  })

  it('keeps the previous page visible and shows updating before pagination', async () => {
    let resolveNextPage: (value: never) => void = () => {}
    vi.mocked(fetchUsers).mockResolvedValueOnce({
      ...emptyPage,
      totalItems: 6,
      totalPages: 2,
      items: [{
        id: 1,
        firstName: 'First',
        lastName: 'User',
        email: 'first@example.com',
        createdAt: '',
        updatedAt: '',
      }],
    } as never)
    const { container } = render(<MemoryRouter><AdminUsers /></MemoryRouter>)
    expect(await screen.findByText('first@example.com')).toBeInTheDocument()

    const pagination = screen.getByRole('navigation', { name: 'Pagination Navigation' })
    vi.mocked(fetchUsers).mockImplementationOnce(() => new Promise((resolve) => {
      resolveNextPage = resolve
    }) as never)
    fireEvent.click(within(pagination).getByRole('button', { name: 'Go to next page' }))

    const updating = await screen.findByText('Updating users...')
    expect(screen.getByText('first@example.com')).toBeInTheDocument()
    expect(container.querySelector('.collection-state--loading')).not.toBeInTheDocument()
    expect(updating.compareDocumentPosition(pagination)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    resolveNextPage({
      ...emptyPage,
      currentPage: 2,
      totalItems: 6,
      totalPages: 2,
    } as never)
  })
})

describe.each([
  {
    label: 'resources',
    fetch: vi.mocked(getResources),
    title: 'Test resource',
    updatingText: 'Updating resources...',
    page: {
      ...emptyPage,
      totalItems: 15,
      totalPages: 2,
      items: [{ id: 1, title: 'Test resource', description: 'Test description', styleType: 'resource-style-green' }],
    },
  },
  {
    label: 'trivia challenges',
    fetch: vi.mocked(getAllTriviaChallenges),
    title: 'Test challenge',
    updatingText: 'Updating trivia challenges...',
    page: {
      ...emptyPage,
      totalItems: 15,
      totalPages: 3,
      items: [{
        id: 1,
        title: 'Test challenge',
        description: 'Test description',
        active: true,
        questions: [],
      }],
    },
  },
])('admin resources $label pagination loading', ({ fetch, title, updatingText, page }) => {
  it('keeps the previous page visible and shows updating before pagination', async () => {
    let resolveNextPage: (value: never) => void = () => {}
    fetch.mockResolvedValueOnce(page as never)
    render(<MemoryRouter><AdminResources /></MemoryRouter>)

    expect(await screen.findByText(title)).toBeInTheDocument()
    const paginations = await screen.findAllByRole('navigation', { name: 'Pagination Navigation' })
    const pagination = fetch === vi.mocked(getResources) ? paginations[0] : paginations[1]

    fetch.mockImplementationOnce(() => new Promise((resolve) => {
      resolveNextPage = resolve
    }) as never)
    fireEvent.click(within(pagination).getByRole('button', { name: 'Go to next page' }))

    const updating = await screen.findByText(updatingText)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(updating.compareDocumentPosition(pagination)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    resolveNextPage({
      ...page,
      currentPage: 2,
    } as never)
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

describe.each([
  {
    label: 'public items',
    Page: ItemSearch,
    fetch: vi.mocked(fetchItems),
    pageSize: 10,
  },
  {
    label: 'admin items',
    Page: AdminItems,
    fetch: vi.mocked(fetchItems),
    pageSize: 5,
  },
])('$label failed page fetch', ({ Page, fetch, pageSize }) => {
  it('clears stale items but keeps pagination available after a later page fails', async () => {
    fetch.mockResolvedValueOnce({
      currentPage: 1,
      totalPages: 6,
      pageSize,
      totalItems: 30,
      items: [{
        id: 1,
        name: 'Stale item',
        recyclable: true,
        largeItem: false,
        information: 'Old item instructions',
      }],
    })
    render(<MemoryRouter><Page /></MemoryRouter>)

    expect(await screen.findByText('Stale item')).toBeInTheDocument()
    const pagination = screen.getByRole('navigation', { name: 'Pagination Navigation' })
    fetch.mockResolvedValueOnce(null as never)
    fireEvent.click(within(pagination).getByRole('button', { name: 'Go to next page' }))

    expect(await screen.findByText(errorText('Items'))).toBeInTheDocument()
    expect(screen.queryByText('Stale item')).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Pagination Navigation' })).toBeInTheDocument()
    expect(within(pagination).getByRole('button', { name: 'Go to page 2' })).toHaveAttribute('aria-current', 'page')
  })
})

describe.each([
  {
    label: 'public items',
    Page: ItemSearch,
    fetch: vi.mocked(fetchItems),
    updatingText: 'Updating items...',
    indicator: '.item-search-loading-indicator',
    page: {
      ...emptyPage,
      pageSize: 10,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, name: 'Test item', recyclable: true, largeItem: false, information: 'Test instructions' }],
    },
    staleItem: 'Test item',
  },
  {
    label: 'admin items',
    Page: AdminItems,
    fetch: vi.mocked(fetchItems),
    updatingText: 'Updating items...',
    indicator: '.admin-items-loading',
    page: {
      ...emptyPage,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, name: 'Test item', recyclable: true, largeItem: false, information: 'Test instructions' }],
    },
    staleItem: 'Test item',
  },
  {
    label: 'public announcements',
    Page: Announcements,
    fetch: vi.mocked(getAnnouncementsPaged),
    updatingText: 'Updating announcements...',
    indicator: '.announcements-loading-indicator',
    page: {
      ...emptyPage,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, title: 'Test announcement', message: 'Test message', type: 'GENERAL', startDate: '2026-01-01T00:00:00Z', endDate: null, active: true }],
    },
    staleItem: 'Test announcement',
  },
  {
    label: 'admin announcements',
    Page: AdminAnnouncements,
    fetch: vi.mocked(getAllAnnouncementsPaged),
    updatingText: 'Updating announcements...',
    indicator: '.admin-announcements-loading-indicator',
    page: {
      ...emptyPage,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, title: 'Test announcement', message: 'Test message', type: 'GENERAL', startDate: '2026-01-01T00:00:00Z', endDate: null, active: true }],
    },
    staleItem: 'Test announcement',
  },
])('$label loading states', ({ Page, fetch, updatingText, indicator, page, staleItem }) => {
  it('uses the collection state on first load and keeps stale items during later fetches', async () => {
    let resolveInitialPage: (value: never) => void = () => {}
    let resolveNextPage: (value: never) => void = () => {}
    fetch.mockImplementationOnce(() => new Promise((resolve) => {
      resolveInitialPage = resolve
    }) as never)
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>)

    await waitFor(() => expect(container.querySelector('.collection-state--loading')).toBeInTheDocument())
    expect(container.querySelector(indicator)).toHaveClass('is-hidden')
    resolveInitialPage(page as never)
    await screen.findByText(staleItem)
    expect(container.querySelector('.collection-state--loading')).not.toBeInTheDocument()

    fetch.mockImplementationOnce(() => new Promise((resolve) => {
      resolveNextPage = resolve
    }) as never)
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))

    expect(await screen.findByText(updatingText)).toBeInTheDocument()
    expect(screen.getByText(staleItem)).toBeInTheDocument()
    expect(container.querySelector('.collection-state--loading')).not.toBeInTheDocument()
    const loadingIndicator = container.querySelector<HTMLElement>(indicator)
    const pagination = screen.getByRole('navigation', { name: 'Pagination Navigation' })
    expect(loadingIndicator?.compareDocumentPosition(pagination)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    if (indicator === '.admin-items-loading') {
      const card = container.querySelector<HTMLElement>('.admin-items-list-section')
      expect(card).toContainElement(loadingIndicator)
      expect(card).toContainElement(pagination)
      expect(pagination).toHaveClass('pagination-container')
      expect(pagination).toHaveClass('admin-items-pagination')
      expect(pagination.querySelector('.pagination-info')?.compareDocumentPosition(
        pagination.querySelector('.pagination-controls')!
      )).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      expect(pagination.querySelector('.pagination-controls')?.compareDocumentPosition(
        pagination.querySelector('.pagination-size-wrapper')!
      )).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    }

    resolveNextPage(page as never)
  })
})

describe('admin items filter loading', () => {
  it('shows the collection loading state instead of updating stale results', async () => {
    let resolveFilteredItems: (value: never) => void = () => {}
    vi.mocked(fetchItems).mockResolvedValueOnce({
      ...emptyPage,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, name: 'Old item', recyclable: false, largeItem: false, information: 'Old instructions' }],
    })
    const { container } = render(<MemoryRouter><AdminItems /></MemoryRouter>)

    await screen.findByText('Old item')
    vi.mocked(fetchItems).mockImplementationOnce(() => new Promise((resolve) => {
      resolveFilteredItems = resolve
    }) as never)
    fireEvent.click(screen.getByRole('button', { name: 'Recyclable' }))

    expect(await screen.findByText('Loading items...')).toBeInTheDocument()
    expect(screen.queryByText('Updating items...')).not.toBeInTheDocument()
    expect(screen.queryByText('Old item')).not.toBeInTheDocument()

    resolveFilteredItems({
      ...emptyPage,
      totalItems: 1,
      items: [{ id: 2, name: 'New item', recyclable: true, largeItem: false, information: 'New instructions' }],
    } as never)
    expect(await screen.findByText('New item')).toBeInTheDocument()
    expect(container.querySelector('.collection-state--loading')).not.toBeInTheDocument()
  })
})

describe.each([
  {
    label: 'public items',
    Page: ItemSearch,
    staleItem: 'Old item',
    loadingText: 'Loading items...',
    indicator: '.item-search-loading-indicator',
    page: {
      ...emptyPage,
      pageSize: 10,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, name: 'Old item', recyclable: true, largeItem: false, information: 'Old instructions' }],
    },
  },
  {
    label: 'admin items',
    Page: AdminItems,
    staleItem: 'Old item',
    loadingText: 'Loading items...',
    indicator: '.admin-items-loading',
    page: {
      ...emptyPage,
      pageSize: 5,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, name: 'Old item', recyclable: true, largeItem: false, information: 'Old instructions' }],
    },
  },
])('$label search loading', ({ Page, staleItem, loadingText, indicator, page }) => {
  it('clears stale results and shows the full loading state while searching', async () => {
    let resolveSearch: (value: never) => void = () => {}
    vi.mocked(fetchItems).mockResolvedValueOnce(page as never)
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>)

    await screen.findByText(staleItem)
    vi.mocked(fetchItems).mockImplementationOnce(() => new Promise((resolve) => {
      resolveSearch = resolve
    }) as never)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search items' }), {
      target: { value: 'searched item' },
    })

    expect(await screen.findByText(loadingText)).toBeInTheDocument()
    expect(screen.queryByText(staleItem)).not.toBeInTheDocument()
    expect(screen.queryByText('Updating items...')).not.toBeInTheDocument()
    expect(container.querySelector('.collection-state--loading')).toBeInTheDocument()
    expect(container.querySelector(indicator)).toHaveClass('is-hidden')

    await waitFor(() => expect(fetchItems).toHaveBeenLastCalledWith(
      'searched item',
      undefined,
      expect.any(AbortSignal),
      1,
      page.pageSize
    ))
    resolveSearch({
      ...emptyPage,
      totalItems: 1,
      items: [{ id: 2, name: 'Searched item', recyclable: true, largeItem: false, information: 'New instructions' }],
    } as never)
    expect(await screen.findByText('Searched item')).toBeInTheDocument()
  })
})

describe('public item search default filter', () => {
  it('selects All Items first and requests without a recyclability filter', async () => {
    render(<MemoryRouter><ItemSearch /></MemoryRouter>)

    expect(screen.getByRole('button', { name: 'All Items' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Recyclable' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Non-Recyclable' })).toHaveAttribute('aria-pressed', 'false')
    await waitFor(() => expect(fetchItems).toHaveBeenCalled())
    expect(vi.mocked(fetchItems).mock.calls[0]?.[1]).toBeUndefined()
  })
})

describe.each([
  {
    label: 'articles',
    fetch: vi.mocked(getResources),
    navigationIndex: 0,
    title: 'Test resource',
    updatingText: 'Updating resources...',
    page: {
      ...emptyPage,
      pageSize: 6,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, title: 'Test resource', description: 'Test description', styleType: 'resource-style-green' }],
    },
  },
  {
    label: 'trivia challenges',
    fetch: vi.mocked(getPaginatedTriviaChallenges),
    navigationIndex: 1,
    title: 'Test challenge',
    updatingText: 'Updating trivia challenges...',
    page: {
      ...emptyPage,
      pageSize: 4,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, title: 'Test challenge', description: 'Test description' }],
    },
  },
])('public educational resources $label pagination loading', ({ fetch, navigationIndex, title, updatingText, page }) => {
  it('keeps the previous page visible and shows an updating state before pagination', async () => {
    let resolveNextPage: (value: never) => void = () => {}
    fetch.mockResolvedValueOnce(page as never)
    const { container } = render(<MemoryRouter><EducationalResources /></MemoryRouter>)

    await screen.findByText(title)
    await waitFor(() => expect(screen.getAllByRole('navigation', { name: 'Pagination Navigation' })).toHaveLength(2))
    const nav = screen.getAllByRole('navigation', { name: 'Pagination Navigation' })[navigationIndex]

    fetch.mockImplementationOnce(() => new Promise((resolve) => {
      resolveNextPage = resolve
    }) as never)
    fireEvent.click(within(nav).getByRole('button', { name: 'Go to next page' }))

    expect(await screen.findByText(updatingText)).toBeInTheDocument()
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(container.querySelector('.collection-state--loading')).not.toBeInTheDocument()
    const indicators = container.querySelectorAll('.announcements-loading-indicator')
    const indicator = indicators[navigationIndex] as HTMLElement
    expect(indicator.compareDocumentPosition(nav)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    resolveNextPage(page as never)
  })
})

describe.each([
  {
    label: 'public items',
    Page: ItemSearch,
    fetch: vi.mocked(fetchItems),
    staleItem: 'Old item',
    loadingText: 'Loading items...',
    indicator: '.item-search-loading-indicator',
    filter: () => fireEvent.click(screen.getByRole('button', { name: 'Non-Recyclable' })),
    page: {
      ...emptyPage,
      totalPages: 3,
      totalItems: 15,
      items: [{ id: 1, name: 'Old item', recyclable: true, largeItem: false, information: 'Old instructions' }],
    },
  },
  {
    label: 'public announcements',
    Page: Announcements,
    fetch: vi.mocked(getAnnouncementsPaged),
    staleItem: 'Old announcement',
    loadingText: 'Loading announcements...',
    indicator: '.announcements-loading-indicator',
    filter: () => fireEvent.change(screen.getByLabelText('Filter by type'), { target: { value: 'EMERGENCY' } }),
    page: {
      ...emptyPage,
      items: [{ id: 1, title: 'Old announcement', message: 'Old message', type: 'GENERAL', startDate: '2026-01-01T00:00:00Z', endDate: null, active: true }],
    },
  },
  {
    label: 'admin announcements',
    Page: AdminAnnouncements,
    fetch: vi.mocked(getAllAnnouncementsPaged),
    staleItem: 'Old announcement',
    loadingText: 'Loading announcements...',
    indicator: '.admin-announcements-loading-indicator',
    filter: () => fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'EMERGENCY' } }),
    page: {
      ...emptyPage,
      items: [{ id: 1, title: 'Old announcement', message: 'Old message', type: 'GENERAL', startDate: '2026-01-01T00:00:00Z', endDate: null, active: true }],
    },
  },
])('$label filter loading', ({ Page, fetch, staleItem, loadingText, indicator, filter, page }) => {
  it('shows the collection loading state without stale results or updating indicator', async () => {
    let resolveFilteredPage: (value: never) => void = () => {}
    fetch.mockResolvedValueOnce(page as never)
    const { container } = render(<MemoryRouter><Page /></MemoryRouter>)

    await screen.findByText(staleItem)
    fetch.mockImplementationOnce(() => new Promise((resolve) => {
      resolveFilteredPage = resolve
    }) as never)
    filter()

    expect(await screen.findByText(loadingText)).toBeInTheDocument()
    expect(screen.queryByText(staleItem)).not.toBeInTheDocument()
    expect(screen.queryByText(/Updating/)).not.toBeInTheDocument()
    expect(container.querySelector('.collection-state--loading')).toBeInTheDocument()
    expect(container.querySelector(indicator)).toHaveClass('is-hidden')

    resolveFilteredPage(emptyPage as never)
  })
})
