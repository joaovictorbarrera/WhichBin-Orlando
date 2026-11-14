import { describe, it, expect, vi } from 'vitest'
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
})
