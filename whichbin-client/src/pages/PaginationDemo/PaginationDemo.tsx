import { useEffect, useState } from 'react'
import PageLayout from '../../components/PageLayout'
import Pagination from '../../components/Pagination/Pagination'
import {
  fetchDemoItems,
  type BinFilter,
  type DemoItem,
} from '../../services/paginationDemoService'
import './PaginationDemo.css'

function PaginationDemo() {
  // The component starts without data or a total count, just as it would while
  // waiting for its first API response.
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [items, setItems] = useState<DemoItem[]>([])
  const [totalItems, setTotalItems] = useState<number>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [binFilter, setBinFilter] = useState<BinFilter>('All')

  // Ignore responses from earlier requests if the selected controls change.
  useEffect(() => {
    let isLatestRequest = true
    const abortController = new AbortController()

    fetchDemoItems(currentPage, pageSize, binFilter, abortController.signal)
      .then((response) => {
        if (!isLatestRequest) {
          return
        }

        setItems(response.items)
        setCurrentPage(response.currentPage)
        setPageSize(response.pageSize)
        setTotalItems(response.totalItems)
      })
      .catch((requestError: unknown) => {
        if (!isLatestRequest || abortController.signal.aborted) {
          return
        }

        setItems([])
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load demo items.'
        )
      })
      .finally(() => {
        if (isLatestRequest) {
          setLoading(false)
        }
      })

    return () => {
      isLatestRequest = false
      abortController.abort()
    }
  }, [currentPage, pageSize, binFilter])

  function handlePageSizeChange(nextPageSize: number) {
    setLoading(true)
    setError(undefined)
    setPageSize(nextPageSize)
  }

  function handlePageChange(nextPage: number) {
    setLoading(true)
    setError(undefined)
    setCurrentPage(nextPage)
  }

  function handleBinFilterChange(nextBinFilter: BinFilter) {
    setLoading(true)
    setError(undefined)
    setBinFilter(nextBinFilter)
    setCurrentPage(1)
  }

  return (
    <PageLayout className="pagination-demo-page" width="wide">
      <header className="pagination-demo-header">
        <p className="pagination-demo-eyebrow">Component preview</p>
        <h1>Pagination demo</h1>
        <p>
          Browse a sample list and try the page buttons or the rows-per-page
          selector. The controls below are the reusable Pagination component.
        </p>
      </header>

      <section className="pagination-demo-card" aria-labelledby="sample-items-title">
        <div className="pagination-demo-filter">
          <label htmlFor="suggested-bin-filter">Filter by suggested bin</label>
          <select
            id="suggested-bin-filter"
            value={binFilter}
            onChange={(event) => {
              const selectedFilter = event.target.value
              if (
                selectedFilter === 'All' ||
                selectedFilter === 'Recycling' ||
                selectedFilter === 'Trash'
              ) {
                handleBinFilterChange(selectedFilter)
              }
            }}
            disabled={loading && totalItems === undefined}
          >
            <option value="All">All bins</option>
            <option value="Recycling">Recycling</option>
            <option value="Trash">Trash</option>
          </select>
        </div>

        <div className="pagination-demo-card-heading">
          <div>
            <h2 id="sample-items-title">Example recycling items</h2>
            <p>
              Dummy data ·{' '}
              {totalItems === undefined
                ? 'Loading total count...'
                : `${totalItems} ${binFilter === 'All' ? 'items' : `${binFilter.toLowerCase()} items`}`}
            </p>
          </div>
        </div>

        <div
          className={`pagination-demo-table-wrapper${loading ? ' is-loading' : ''}`}
        >
          {loading && (
            <span className="pagination-demo-visually-hidden" role="status">
              Loading items...
            </span>
          )}
          <table className="pagination-demo-table" aria-busy={loading}>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Item</th>
                <th scope="col">Category</th>
                <th scope="col">Suggested bin</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td className="pagination-demo-error" colSpan={4} role="alert">
                    {error}
                  </td>
                </tr>
              ) : loading && items.length === 0 ? (
                Array.from({ length: pageSize }, (_, index) => (
                  <tr key={`loading-${index}`} aria-hidden="true">
                    <td>&nbsp;</td>
                    <td />
                    <td />
                    <td />
                  </tr>
                ))
              ) : items.length === 0 ? (
                Array.from({ length: pageSize }, (_, index) => (
                  <tr key={`empty-${index}`} aria-hidden={index > 0}>
                    {index === 0 ? (
                      <td colSpan={4}>No items found for this page.</td>
                    ) : (
                      <>
                        <td />
                        <td />
                        <td />
                        <td />
                      </>
                    )}
                  </tr>
                ))
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      <span
                        className={`pagination-demo-bin ${
                          item.bin === 'Recycling'
                            ? 'pagination-demo-bin-recycling'
                            : 'pagination-demo-bin-trash'
                        }`}
                      >
                        {item.bin}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          siblingCount={1}
        />
      </section>
    </PageLayout>
  )
}

export default PaginationDemo
