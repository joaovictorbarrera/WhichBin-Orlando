import { useEffect, useState } from 'react'
import PageLayout from '../../components/PageLayout'
import Pagination from '../../components/Pagination'
import './PaginationDemo.css'

type DemoItem = {
  id: number
  name: string
  category: string
  bin: 'Recycling' | 'Trash'
}

type BinFilter = 'All' | DemoItem['bin']

// The mock API uses this predictable local list as its backing data store.
const DEMO_ITEMS: DemoItem[] = Array.from({ length: 47 }, (_, index) => {
  const examples: Omit<DemoItem, 'id'>[] = [
    { name: 'Glass beverage bottle', category: 'Glass', bin: 'Recycling' },
    { name: 'Cardboard shipping box', category: 'Paper', bin: 'Recycling' },
    { name: 'Plastic water bottle', category: 'Plastic', bin: 'Recycling' },
    { name: 'Used paper towel', category: 'Paper', bin: 'Trash' },
    { name: 'Aluminum drink can', category: 'Metal', bin: 'Recycling' },
    { name: 'Food-soiled pizza box', category: 'Paper', bin: 'Trash' },
    { name: 'Empty cleaning bottle', category: 'Plastic', bin: 'Recycling' },
  ]

  // Repeat a few realistic examples while giving every row its own stable ID.
  return {
    id: index + 1,
    ...examples[index % examples.length],
  }
})

const SIMULATED_API_DELAY_MS = 1000

type DemoApiResponse = {
  items: DemoItem[]
  totalItems: number
}

// Model a paginated API response: both the requested page and the total count
// arrive together after the simulated network delay.
function fetchDemoItems(
  page: number,
  pageSize: number,
  binFilter: BinFilter
): Promise<DemoApiResponse> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const filteredItems =
        binFilter === 'All'
          ? DEMO_ITEMS
          : DEMO_ITEMS.filter((item) => item.bin === binFilter)
      const firstItemIndex = (page - 1) * pageSize

      resolve({
        items: filteredItems.slice(firstItemIndex, firstItemIndex + pageSize),
        totalItems: filteredItems.length,
      })
    }, SIMULATED_API_DELAY_MS)
  })
}

function PaginationDemo() {
  // The component starts without data or a total count, just as it would while
  // waiting for its first API response.
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [items, setItems] = useState<DemoItem[]>([])
  const [totalItems, setTotalItems] = useState<number>()
  const [loading, setLoading] = useState(true)
  const [binFilter, setBinFilter] = useState<BinFilter>('All')

  // Every page or page-size change starts another simulated request. Ignore
  // responses from older requests if the user changes controls before one ends.
  useEffect(() => {
    let isLatestRequest = true

    fetchDemoItems(currentPage, pageSize, binFilter).then((response) => {
      if (!isLatestRequest) {
        return
      }

      setItems(response.items)
      setTotalItems(response.totalItems)
      setLoading(false)
    })

    return () => {
      isLatestRequest = false
    }
  }, [currentPage, pageSize, binFilter])

  // The total page count is unknown until the first response supplies totalItems.
  const totalPages =
    totalItems === undefined ? 1 : Math.ceil(totalItems / pageSize)

  function handlePageSizeChange(nextPageSize: number) {
    setLoading(true)
    setPageSize(nextPageSize)

  }

  function handlePageChange(nextPage: number) {
    setLoading(true)
    setCurrentPage(nextPage)
  }

  function handleBinFilterChange(nextBinFilter: BinFilter) {
    setLoading(true)
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

        <div className="pagination-demo-table-wrapper">
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
              {loading ? (
                <tr>
                  <td className="pagination-demo-loading" colSpan={4} role="status">
                    <span className="pagination-demo-spinner" aria-hidden="true" />
                    Loading items...
                  </td>
                </tr>
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
          totalPages={totalPages}
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
