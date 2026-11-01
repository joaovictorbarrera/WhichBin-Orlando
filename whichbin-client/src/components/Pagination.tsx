import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './Pagination.css'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  siblingCount?: number
  className?: string
}

type PaginationItem = number | 'ELLIPSIS_LEFT' | 'ELLIPSIS_RIGHT'

function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PaginationItem[] {
  const safeTotalPages = Math.max(1, totalPages)
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages)
  const totalNumbersToShow = siblingCount * 2 + 5

  if (safeTotalPages <= totalNumbersToShow) {
    return Array.from({ length: safeTotalPages }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(safeCurrentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(safeCurrentPage + siblingCount, safeTotalPages)

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < safeTotalPages - 2

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, 'ELLIPSIS_RIGHT', safeTotalPages]
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount
    const startPage = safeTotalPages - rightItemCount + 1
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => startPage + i)
    return [1, 'ELLIPSIS_LEFT', ...rightRange]
  }

  const middleRangeLength = rightSiblingIndex - leftSiblingIndex + 1
  const middleRange = Array.from({ length: middleRangeLength }, (_, i) => leftSiblingIndex + i)
  return [1, 'ELLIPSIS_LEFT', ...middleRange, 'ELLIPSIS_RIGHT', safeTotalPages]
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  siblingCount = 1,
  className = '',
}: PaginationProps) {
  const displayTotalPages = Math.max(1, totalPages)
  const displayCurrentPage = Math.min(Math.max(1, currentPage), displayTotalPages)
  const paginationRange = generatePaginationRange(displayCurrentPage, displayTotalPages, siblingCount)

  let statusText: string
  if (totalItems !== undefined) {
    if (pageSize !== undefined && pageSize > 0) {
      if (totalItems === 0) {
        statusText = 'Showing 0 of 0 items'
      } else {
        const startItem = (displayCurrentPage - 1) * pageSize + 1
        const endItem = Math.min(displayCurrentPage * pageSize, totalItems)
        statusText = `Showing ${startItem}–${endItem} of ${totalItems} items`
      }
    } else {
      statusText = `Page ${displayCurrentPage} of ${displayTotalPages} (${totalItems} items)`
    }
  } else {
    statusText = `Page ${displayCurrentPage} of ${displayTotalPages}`
  }

  const isPrevDisabled = currentPage <= 1 || totalPages <= 1
  const isNextDisabled = currentPage >= totalPages || totalPages <= 1

  const resolvedPageSizeOptions =
    pageSize !== undefined && !pageSizeOptions.includes(pageSize)
      ? [...pageSizeOptions, pageSize].sort((a, b) => a - b)
      : pageSizeOptions

  const containerClasses = ['pagination-container', className].filter(Boolean).join(' ')

  return (
    <nav className={containerClasses} aria-label="Pagination Navigation">
      <div className="pagination-info" aria-live="polite" aria-atomic="true">
        {statusText}
      </div>

      <ul className="pagination-controls" role="list">
        <li className="pagination-item">
          <button
            type="button"
            className="pagination-button pagination-prev"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isPrevDisabled}
            aria-label="Go to previous page"
          >
            <FiChevronLeft aria-hidden="true" />
            <span className="pagination-button-text">Previous</span>
          </button>
        </li>

        {paginationRange.map((pageItem, index) => {
          if (typeof pageItem === 'string') {
            return (
              <li key={`ellipsis-${pageItem}-${index}`} className="pagination-item">
                <span className="pagination-ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              </li>
            )
          }

          const isCurrent = pageItem === currentPage

          return (
            <li key={`page-${pageItem}`} className="pagination-item">
              <button
                type="button"
                className={`pagination-button ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange(pageItem)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Go to page ${pageItem}`}
              >
                {pageItem}
              </button>
            </li>
          )
        })}

        <li className="pagination-item">
          <button
            type="button"
            className="pagination-button pagination-next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isNextDisabled}
            aria-label="Go to next page"
          >
            <span className="pagination-button-text">Next</span>
            <FiChevronRight aria-hidden="true" />
          </button>
        </li>
      </ul>

      {pageSize !== undefined && onPageSizeChange !== undefined && (
        <div className="pagination-size-wrapper">
          <label htmlFor="pagination-page-size-select" className="pagination-size-label">
            Rows per page:
          </label>
          <select
            id="pagination-page-size-select"
            className="pagination-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Select page size"
          >
            {resolvedPageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  )
}

export default Pagination
