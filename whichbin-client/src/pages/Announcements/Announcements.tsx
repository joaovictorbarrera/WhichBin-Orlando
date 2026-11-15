import CollectionState from '../../components/CollectionState'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiChevronRight } from 'react-icons/fi'
import {
  announcementTypes,
  getAnnouncementsPaged,
  type AnnouncementType,
  type Announcement,
} from '../../services/announcementService'
import PageLayout from '../../components/PageLayout'
import Pagination from '../../components/Pagination/Pagination'
import './Announcements.css'

function formatType(type: string) {
  return type.replaceAll('_', ' ')
}

function formatDateTime(dateTime: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime))
}

function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filterType, setFilterType] = useState<AnnouncementType | ''>('')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalItems, setTotalItems] = useState<number>()
  const [error, setError] = useState<string>()
  const [refreshKey, setRefreshKey] = useState(0)
  const queryKey = `${currentPage}:${pageSize}:${filterType}:${refreshKey}`
  const [loadedQueryKey, setLoadedQueryKey] = useState<string | null>(null)
  const loading = loadedQueryKey !== queryKey
  const updating = loading && loadedQueryKey !== null
  const paginationAnchorRef = useRef<HTMLDivElement>(null)
  const pendingPaginationTop = useRef<number | null>(null)

  useEffect(() => {
    let isLatestRequest = true
    const abortController = new AbortController()

    getAnnouncementsPaged(
      currentPage,
      pageSize,
      filterType || undefined,
      abortController.signal
    )
      .then((response) => {
        if (!isLatestRequest) {
          return
        }

        setAnnouncements(response.items)
        setTotalItems(response.totalItems)
        setError(undefined)
      })
      .catch((requestError: unknown) => {
        if (!isLatestRequest || abortController.signal.aborted) {
          return
        }

        setAnnouncements([])
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load announcements.'
        )
      })
      .finally(() => {
        if (isLatestRequest) {
          setLoadedQueryKey(queryKey)
        }
      })

    return () => {
      isLatestRequest = false
      abortController.abort()
    }
  }, [currentPage, pageSize, filterType, queryKey])

  useLayoutEffect(() => {
    if (loading || pendingPaginationTop.current === null) {
      return
    }

    const paginationTop = paginationAnchorRef.current?.getBoundingClientRect().top
    if (paginationTop !== undefined) {
      window.scrollBy(0, paginationTop - pendingPaginationTop.current)
    }

    pendingPaginationTop.current = null
  }, [announcements, loading])

function preservePaginationPosition() {
  const paginationTop = paginationAnchorRef.current?.getBoundingClientRect().top
  pendingPaginationTop.current = paginationTop ?? null
}

function handlePageChange(nextPage: number) {
  preservePaginationPosition()
  setCurrentPage(nextPage)
}

function handlePageSizeChange(nextPageSize: number) {
  preservePaginationPosition()
  setPageSize(nextPageSize)
  setCurrentPage(1)
}

function handleFilterChange(nextFilter: AnnouncementType | '') {
  if (nextFilter === filterType) {
    return
  }

  setFilterType(nextFilter)
  setCurrentPage(1)
  setAnnouncements([])
  setTotalItems(undefined)
  setError(undefined)
  setLoadedQueryKey(null)
}

  return (
    <PageLayout className="announcements-page" width="wide">
      <div className="announcements-header">
        <div className="announcements-heading-icon">
          <FiBell aria-hidden="true" />
        </div>

        <div>
          <h1>Announcements</h1>
          <p className="announcements-intro">
            Stay up to date with recycling service changes, schedule updates,
            and important notices from the City of Orlando.
          </p>
        </div>
      </div>

      <div className="announcements-filter">
        <label htmlFor="announcements-type-filter">Filter by type</label>
        <select
          id="announcements-type-filter"
          value={filterType}
          onChange={(event) =>
            handleFilterChange(event.target.value as AnnouncementType | '')
          }
        >
          <option value="">All types</option>
          {announcementTypes.map((announcementType) => (
            <option key={announcementType.value} value={announcementType.value}>
              {announcementType.label}
            </option>
          ))}
        </select>
      </div>

      {loading && loadedQueryKey === null && <CollectionState state="loading" name="announcements" />}
      {!loading && error && <CollectionState state="error" name="announcements" onRetry={() => setRefreshKey((key) => key + 1)} />}

      {!loading && !error && announcements.length === 0 && (
        <CollectionState state="empty" name="announcements" description={null}><p>
          {filterType
            ? 'No announcements of this type are available right now.'
            : 'No announcements are available right now.'}
        </p></CollectionState>
      )}

      {!error && announcements.length > 0 && (
        <div className="announcements-list collection-list">
          {announcements.map((announcement) => (
            <Link
              to={`/announcements/${announcement.id}`}
              className={`announcement-card announcement-${announcement.type
                .toLowerCase()
                .replaceAll('_', '-')}`}
              key={announcement.id}
            >
              <div className="announcement-card-content">
                <div className="announcement-card-top">
                  <span className="announcement-type">
                    {formatType(announcement.type)}
                  </span>

                  <span className="announcement-date">
                    {formatDateTime(announcement.startDate)}
                  </span>
                </div>

                <h2>{announcement.title}</h2>

                <p className="announcement-preview">
                  {announcement.message}
                </p>

                {announcement.endDate && (
                  <small>
                    Available through {formatDateTime(announcement.endDate)}
                  </small>
                )}
              </div>

              <FiChevronRight
                className="announcement-arrow"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
      <div
        ref={paginationAnchorRef}
      >
        <div
          className={`announcements-loading-indicator${updating ? '' : ' is-hidden'}`}
          role={updating ? 'status' : undefined}
          aria-hidden={!updating}
        >
          {updating && (
            <>
              <span className="announcements-loading-spinner" aria-hidden="true" />
              Updating announcements...
            </>
          )}
        </div>
        {totalItems !== undefined && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

    </PageLayout>
  )
}

export default Announcements