import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch,
  FiX,
  FiTrash2,
  FiAlertCircle,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import PageLayout from '../components/PageLayout'
import { fetchItems, type Item } from '../services/itemService'
import './ItemSearch.css'

type FilterOption = 'all' | 'recyclable' | 'non-recyclable'

function ItemSearch() {
  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isMounted = true

    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)

      const recycleableParam =
        filter === 'recyclable'
          ? true
          : filter === 'non-recyclable'
            ? false
            : undefined

      fetchItems(searchText.trim() || undefined, recycleableParam)
        .then((data) => {
          if (!isMounted) return

          if (data === null) {
            setError('Unable to load items. Please try again later.')
            setItems([])
          } else {
            setItems(data)
            setError(null)
          }
          setLoading(false)
        })
        .catch(() => {
          if (!isMounted) return
          setError('Unable to load items. Please try again later.')
          setItems([])
          setLoading(false)
        })
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchText, filter, retryCount])

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
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
          >
            All Items
          </button>
          <button
            type="button"
            className={`item-filter-btn ${filter === 'recyclable' ? 'active' : ''}`}
            onClick={() => setFilter('recyclable')}
            aria-pressed={filter === 'recyclable'}
          >
            <FaRecycle aria-hidden="true" />
            Recyclable
          </button>
          <button
            type="button"
            className={`item-filter-btn ${filter === 'non-recyclable' ? 'active' : ''}`}
            onClick={() => setFilter('non-recyclable')}
            aria-pressed={filter === 'non-recyclable'}
          >
            <FiTrash2 aria-hidden="true" />
            Non-Recyclable
          </button>
        </div>
      </section>

      {loading && (
        <div className="item-search-status" role="status">
          <div className="loading-spinner" aria-hidden="true" />
          <p>Loading items...</p>
        </div>
      )}

      {!loading && error && (
        <div className="item-search-status item-search-error" role="alert">
          <FiAlertCircle className="status-icon" aria-hidden="true" />
          <h2>Unable to load items</h2>
          <p>{error}</p>
          <button
            type="button"
            className="item-search-retry-btn"
            onClick={() => setRetryCount((prev) => prev + 1)}
          >
            <FiRefreshCw aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="item-search-status item-search-empty">
          <FiSearch className="status-icon" aria-hidden="true" />
          <h2>No items found</h2>
          <p>
            {searchText.trim()
              ? `No items matched "${searchText}". Try searching for another item or adjust your filter.`
              : 'There are no items matching the selected filter.'}
          </p>
          {(searchText.trim() || filter !== 'all') && (
            <button
              type="button"
              className="item-search-reset-btn"
              onClick={() => {
                setSearchText('')
                setFilter('all')
              }}
            >
              Clear search & filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="item-search-list">
          {items.map((item) => (
            <Link
              to={`/item-search/${item.id}`}
              className={`item-card ${
                item.recycleable ? 'item-card-recyclable' : 'item-card-trash'
              }`}
              key={item.id}
            >
              <div className="item-card-body">
                <div className="item-card-header">
                  <span
                    className={`item-badge ${
                      item.recycleable ? 'badge-recyclable' : 'badge-trash'
                    }`}
                  >
                    {item.recycleable ? (
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
                </div>

                <h2 className="item-card-title">{item.name}</h2>
                <p className="item-card-instructions">{item.information}</p>
              </div>

              <FiChevronRight className="item-card-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  )
}

export default ItemSearch
