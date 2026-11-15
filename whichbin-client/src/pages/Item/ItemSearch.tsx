import CollectionState from '../../components/CollectionState'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch,
  FiX,
  FiTrash2,
  FiBox,
  FiChevronRight,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import PageLayout from '../../components/PageLayout'
import Pagination from '../../components/Pagination/Pagination'
import { fetchItems, type Item } from '../../services/itemService'
import { isAbortError } from '../../helpers/ErrorHelper'
import './ItemSearch.css'

type FilterOption = 'all' | 'recyclable' | 'non-recyclable'

function ItemSearch() {
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [items, setItems] = useState<Item[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const updating = loading && hasLoaded

  function changeFilter(value: FilterOption) {
    if (value === filter) {
      return
    }

    setFilter(value)
    setPage(1)
    setItems([])
    setHasLoaded(false)
    setLoading(true)
    setError(null)
  }

  function changePageSize(value: number) {
    setPageSize(value)
    setPage(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
      setPage(1)
    }, 250)

    return () => clearTimeout(timer)
  }, [searchText])

  useEffect(() => {
    const controller = new AbortController()
    let isMounted = true

    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)

      async function loadItems() {
        try {
          const recyclableParam =
            filter === 'recyclable'
              ? true
              : filter === 'non-recyclable'
                ? false
                : undefined
          const data = await fetchItems(
            debouncedSearchText.trim(),
            recyclableParam,
            controller.signal,
            page,
            pageSize
          )
          if (!isMounted) return

          if (data === null) {
            setError('Unable to load items. Please try again later.')
            return
          }

          if (page > Math.max(1, data.totalPages)) {
            setPage(Math.max(1, data.totalPages))
            return
          }

          setItems(data.items)
          setTotalItems(data.totalItems)
          setHasLoaded(true)
        } catch (requestError) {
          if (!isMounted || isAbortError(requestError)) return
          setError('Unable to load items. Please try again later.')
        } finally {
          if (isMounted) setLoading(false)
        }
      }

      void loadItems()
    }, 0)

    return () => {
      isMounted = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [debouncedSearchText, filter, refreshKey, page, pageSize])

  return (
    <PageLayout className="item-search-page" width="wide">
      <div className="item-search-header">
        <div className="item-search-heading-icon">
          <FiSearch aria-hidden="true" />
        </div>

        <div>
          <h1>Item Search</h1>
          <p className="item-search-intro">
            Look up household items to see if they can be recycled in Orlando and find proper disposal instructions.
          </p>
        </div>
      </div>

      <section className="item-search-controls" aria-label="Search and filter items">
        <form
          className="item-search-input-wrapper"
          onSubmit={(e) => e.preventDefault()}
        >
          <FiSearch className="item-search-input-icon" aria-hidden="true" />
          <input
            type="text"
            className="item-search-input"
            placeholder="Search items (e.g., plastic bottle, cardboard, battery)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            aria-label="Search items"
          />
          {searchText && (
            <button
              type="button"
              className="item-search-clear-btn"
              onClick={() => setSearchText('')}
              aria-label="Clear search text"
            >
              <FiX aria-hidden="true" />
            </button>
          )}
        </form>

        <div
          className="item-search-filters"
          role="group"
          aria-label="Filter items by recyclability"
        >

          <button
            type="button"
            className={`item-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => changeFilter('all')}
            aria-pressed={filter === 'all'}
          >
            All Items
          </button>
          <button
            type="button"
            className={`item-filter-btn ${filter === 'recyclable' ? 'active' : ''}`}
            onClick={() => changeFilter('recyclable')}
            aria-pressed={filter === 'recyclable'}
          >
            <FaRecycle aria-hidden="true" />
            Recyclable
          </button>
          <button
            type="button"
            className={`item-filter-btn ${filter === 'non-recyclable' ? 'active' : ''}`}
            onClick={() => changeFilter('non-recyclable')}
            aria-pressed={filter === 'non-recyclable'}
          >
            <FiTrash2 aria-hidden="true" />
            Non-Recyclable
          </button>
        </div>
      </section>

      {loading && !hasLoaded && <CollectionState state="loading" name="items" />}
      {!loading && error && <CollectionState state="error" name="items" onRetry={() => setRefreshKey((key) => key + 1)} />}

      {!loading && !error && hasLoaded && items.length === 0 && (
        <CollectionState state="empty" name="items" description={null}>
          <p>
            {searchText.trim()
              ? `No items matched "${debouncedSearchText.trim()}". Try another search or adjust the filter.`
              : 'There are no items matching the selected filter.'}
          </p>
          {(searchText.trim() || filter !== 'all') && (
            <button
              type="button"
              className="item-search-reset-btn"
              onClick={() => {
                setSearchText('')
                changeFilter('all')
              }}
            >
              Clear search & filters
            </button>
          )}
        </CollectionState>
      )}

      {items.length > 0 && (
        <div className="item-search-list collection-list" aria-busy={loading}>
          {items.map((item) => (
            <Link
              to={`/item-search/${item.id}`}
              className={`item-card ${
                item.recyclable ? 'item-card-recyclable' : 'item-card-trash'
              }`}
              key={item.id}
            >
              <div className="item-card-body">
                <div className="item-card-header">
                  <span
                    className={`item-badge ${
                      item.recyclable ? 'badge-recyclable' : 'badge-trash'
                    }`}
                  >
                    {item.recyclable ? (
                      <>
                        <FaRecycle aria-hidden="true" />
                        <span>Recyclable</span>
                      </>
                    ) : (
                      <>
                        <FiTrash2 aria-hidden="true" />
                        <span>Non-Recyclable</span>
                      </>
                    )}
                  </span>
                  {item.recyclable && item.largeItem && (
                    <span className="item-badge badge-large-item">
                      <FiBox aria-hidden="true" />
                      <span>Large item pickup</span>
                    </span>
                  )}
                </div>

                <h2 className="item-card-title">{item.name}</h2>
                <p className="item-card-instructions">{item.information}</p>
              </div>

              <FiChevronRight className="item-card-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
      <div
        className={`item-search-loading-indicator${updating ? '' : ' is-hidden'}`}
        role={updating ? 'status' : undefined}
        aria-hidden={!updating}
      >
        {updating && (
          <>
            <div className="loading-spinner" aria-hidden="true" />
            <span>Updating items...</span>
          </>
        )}
      </div>
      {hasLoaded && (
        <Pagination
          currentPage={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      )}
    </PageLayout>
  )
}

export default ItemSearch
