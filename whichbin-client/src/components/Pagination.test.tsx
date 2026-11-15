import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Pagination from './Pagination/Pagination'

describe('Pagination Component', () => {
  it('renders without crashing and displays correct status text', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={45}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByText('Showing 1–10 of 45 items')).toBeInTheDocument()
  })

  it('disables previous button on the first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={45}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    )

    const prevButton = screen.getByRole('button', { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('triggers onPageChange when clicking the next button', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination
        currentPage={1}
        totalItems={45}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()
    fireEvent.click(nextButton)
    expect(handlePageChange).toHaveBeenCalledTimes(1)
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('updates the selected page after a page option is tapped', () => {
    function StatefulPagination() {
      const [currentPage, setCurrentPage] = useState(1)

      return (
        <Pagination
          currentPage={currentPage}
          totalItems={100}
          pageSize={10}
          onPageChange={setCurrentPage}
        />
      )
    }

    render(<StatefulPagination />)

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }))

    expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Go to page 1' })).not.toHaveClass('active')
  })

  it('handles loading state with null totalItems and disables controls', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={null}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.getByText('Showing 0 of 0 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it.each([
    { currentPage: 1, totalItems: 100, expectedPages: ['1', '2', '3', '4', '5', '10'], ellipses: 1 },
    { currentPage: 5, totalItems: 100, expectedPages: ['1', '4', '5', '6', '10'], ellipses: 2 },
    { currentPage: 10, totalItems: 100, expectedPages: ['1', '6', '7', '8', '9', '10'], ellipses: 1 },
  ])('keeps page options and ellipses within seven slots on page $currentPage', ({ currentPage, totalItems, expectedPages, ellipses }) => {
    render(
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    )

    const pageButtons = screen.getAllByRole('button', { name: /^Go to page \d+$/ })
    expect(pageButtons.map((button) => button.textContent)).toEqual(expectedPages)
    expect(document.querySelectorAll('.pagination-ellipsis')).toHaveLength(ellipses)
    expect(pageButtons.length + ellipses).toBeLessThanOrEqual(7)
  })

  it('keeps the page-size selector accessible with a visible label', () => {
    render(
      <Pagination
        currentPage={1}
        totalItems={45}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    )

    expect(screen.getByRole('combobox', { name: 'Select page size' })).toBeInTheDocument()
    expect(screen.getByText('Rows per page:')).toBeInTheDocument()
  })
})
