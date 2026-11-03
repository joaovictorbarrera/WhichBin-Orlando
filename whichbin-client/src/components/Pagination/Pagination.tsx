import { useId, useEffect, useMemo } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './Pagination.css'

export interface PaginationProps {
  currentPage: number
  totalItems?: number | null
  pageSize?: number
  pageSizeOptions?: number[]
  displayName?: string // Optional: e.g. "articles", "announcements", "items". Default: "items"
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
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  displayName = 'items',
  onPageChange,
  onPageSizeChange,
  siblingCount = 1,
  className = '',
}: PaginationProps) {
  const pageSizeSelectId = useId()

  const effectivePageSize = pageSize && pageSize > 0 ? pageSize : 10
  const isDataLoaded = totalItems != null
  const totalPages = isDataLoaded ? Math.max(1, Math.ceil(totalItems / effectivePageSize)) : 1
  const displayCurrentPage = Math.max(1, Math.min(currentPage, totalPages))

  // Out-of-bounds page clamping: sync parent state if currentPage exceeds totalPages
  useEffect(() => {
    if (isDataLoaded && currentPage > totalPages) {
      onPageChange(displayCurrentPage)
    }
  }, [isDataLoaded, currentPage, totalPages, displayCurrentPage, onPageChange])

  const paginationRange = useMemo(
    () => generatePaginationRange(displayCurrentPage, totalPages, siblingCount),
    [displayCurrentPage, totalPages, siblingCount]
  )

  let statusText: string
  if (!isDataLoaded || totalItems === 0) {
    statusText = `Showing 0 of 0 ${displayName}`
  } else {
    const startItem = (displayCurrentPage - 1) * effectivePageSize + 1
    const endItem = Math.min(displayCurrentPage * effectivePageSize, totalItems)
    statusText = `Showing ${startItem}–${endItem} of ${totalItems} ${displayName}`
  }

  // Interactive controls disabled state
  const isPrevDisabled = !isDataLoaded || displayCurrentPage <= 1 || totalPages <= 1
  const isNextDisabled = !isDataLoaded || displayCurrentPage >= totalPages || totalPages <= 1
  const arePageButtonsDisabled = !isDataLoaded || totalItems === 0

  const resolvedPageSizeOptions = useMemo(() => {
    const currentSize = pageSize ?? effectivePageSize
    if (!pageSizeOptions.includes(currentSize)) {
      return [...pageSizeOptions, currentSize].sort((a, b) => a - b)
    }
    return pageSizeOptions
  }, [pageSize, effectivePageSize, pageSizeOptions])

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
            onClick={() => onPageChange(displayCurrentPage - 1)}
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

          const isCurrent = pageItem === displayCurrentPage

          return (
            <li key={`page-${pageItem}`} className="pagination-item">
              <button
                type="button"
                className={`pagination-button ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange(pageItem)}
                disabled={arePageButtonsDisabled}
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
            onClick={() => onPageChange(displayCurrentPage + 1)}
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
          <label htmlFor={pageSizeSelectId} className="pagination-size-label">
            Rows per page:
          </label>
          <select
            id={pageSizeSelectId}
            className="pagination-page-size pagination-select"
            disabled={!isDataLoaded}
            value={pageSize ?? effectivePageSize}
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
