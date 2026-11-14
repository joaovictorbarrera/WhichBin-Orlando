import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import EducationalResources from './EducationalResources'
import { getResources } from '../../services/resourceService'
import { getPaginatedTriviaChallenges } from '../../services/triviaService'

vi.mock('../../services/resourceService', () => ({
  getResources: vi.fn(),
}))

vi.mock('../../services/triviaService', () => ({
  getPaginatedTriviaChallenges: vi.fn(),
}))

const emptyPage = {
  currentPage: 1,
  totalPages: 0,
  pageSize: 10,
  totalItems: 0,
  items: [],
}

function renderPage() {
  return render(
    <MemoryRouter>
      <EducationalResources />
    </MemoryRouter>
  )
}

describe('EducationalResources', () => {
  beforeEach(() => {
    vi.mocked(getResources).mockResolvedValue(emptyPage)
    vi.mocked(getPaginatedTriviaChallenges).mockResolvedValue(emptyPage)
  })

  it('shows separate empty messages before pagination when both requests succeed', async () => {
    renderPage()

    const articlesMessage = await screen.findByText(
      'No articles are available right now.'
    )
    const triviaMessage = await screen.findByText(
      'No trivia challenges are available right now.'
    )

    expect(
      screen.queryByText('No educational resources are available right now.')
    ).not.toBeInTheDocument()

    const articleSection = articlesMessage.closest('section')
    const triviaSection = triviaMessage.closest('section')
    if (!articleSection || !triviaSection) {
      throw new Error('Empty-state messages should be inside their sections')
    }

    const articlePagination = within(articleSection).getByRole('navigation', {
      name: 'Pagination Navigation',
    })
    const triviaPagination = within(triviaSection!).getByRole('navigation', {
      name: 'Pagination Navigation',
    })
    expect(
      Array.from(articleSection.children).indexOf(
        within(articleSection).getByRole('heading', { name: 'Articles' })
      )
    ).toBeLessThan(Array.from(articleSection.children).indexOf(articlesMessage))
    expect(
      Array.from(articleSection.children).indexOf(articlesMessage)
    ).toBeLessThan(Array.from(articleSection.children).indexOf(articlePagination))
    expect(
      Array.from(triviaSection.children).indexOf(
        within(triviaSection).getByRole('heading', { name: 'Trivia' })
      )
    ).toBeLessThan(Array.from(triviaSection.children).indexOf(triviaMessage))
    expect(
      Array.from(triviaSection.children).indexOf(triviaMessage)
    ).toBeLessThan(Array.from(triviaSection.children).indexOf(triviaPagination))
  })

  it('hides pagination for a failed request but keeps it for a successful empty result', async () => {
    vi.mocked(getResources).mockResolvedValue(null)
    renderPage()

    await screen.findByText('No trivia challenges are available right now.')

    expect(
      screen.queryByText('No articles are available right now.')
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('navigation', { name: 'Pagination Navigation' })
    ).toHaveLength(1)
  })
})
