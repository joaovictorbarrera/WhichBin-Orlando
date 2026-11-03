# Reusable Pagination Component (`Pagination.tsx`)

The `Pagination` component is an accessible, WCAG 2.1 AA compliant, responsive pagination control built for WhichBin Orlando (`whichbin-client`). It provides navigation controls, smart numeric ranges with ellipsis truncation, optional page size selection, and feedback status text.

---

## Features

- **Automatic `totalPages` Calculation**: Developers only pass `totalItems` and `pageSize`; the component calculates `totalPages` internally (`Math.ceil(totalItems / pageSize)`).
- **Initial Loading & Error Fallback**: When `totalItems` is `null` or `undefined` (loading or fetch error), all interactive controls are disabled and status displays `"Showing 0 of 0 {displayName}"`.
- **Out-of-Bounds Page Clamping**: If filters reduce the total items and `currentPage` exceeds `totalPages`, the component visually clamps to the valid range and automatically calls `onPageChange(displayCurrentPage)` to keep parent state in sync.
- **Active Page Highlight Sync**: Uses `displayCurrentPage` to ensure the highlighted active page button stays accurate even before the parent state updates.
- **Collision-Free IDs with `useId()`**: Generates unique IDs for form labels and `<select>` dropdowns to allow multiple instances on the same page.
- **Customizable Entity Name**: Supports an optional `displayName` prop (e.g., `"articles"`, `"announcements"`, `"items"`).
- **WCAG 2.1 AA Accessibility**: Semantic `<nav>`, `aria-current="page"`, descriptive button `aria-label`s, live regions (`aria-live="polite"`), and high-contrast visible focus rings.
- **Zero Inline Styles**: Fully styled via `Pagination.css` following WhichBin Orlando design tokens.

---

## Props Reference

| Prop Name | Type | Required / Optional | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `currentPage` | `number` | **Required** | — | The current active 1-based page number. |
| `onPageChange` | `(page: number) => void` | **Required** | — | Callback fired when user selects a page or navigates Prev/Next. |
| `totalItems` | `number \| null \| undefined` | Optional | `undefined` | Total number of items across all pages. If `null`/`undefined`, component enters disabled loading state. |
| `pageSize` | `number` | Optional | `10` | Number of items displayed per page. |
| `pageSizeOptions` | `number[]` | Optional | `[10, 20, 50]` | Dropdown choices for rows per page. |
| `onPageSizeChange`| `(pageSize: number) => void` | Optional | — | Callback fired when the user selects a new page size. |
| `displayName` | `string` | Optional | `'items'` | Plural entity name used in status text (e.g. `"resources"`, `"announcements"`). |
| `siblingCount` | `number` | Optional | `1` | Number of sibling page numbers to show on each side of the active page before displaying an ellipsis (`...`). |
| `className` | `string` | Optional | `''` | Additional custom CSS classes applied to the root `<nav>` element. |

---

## Developer Integration Example

Here is a full integration example for feature developers implementing pagination in Items, Announcements, or Educational Resources:

```tsx
import { useState, useMemo, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { fetchItems, type Item } from '../services/itemService'

export function ItemList() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  // Load items from service
  useEffect(() => {
    let isMounted = true
    fetchItems(searchTerm)
      .then((data) => {
        if (isMounted) setItems(data)
      })
      .catch(() => {
        if (isMounted) setItems([])
      })

    return () => {
      isMounted = false
    }
  }, [searchTerm])

  // Filter items
  const filteredItems = useMemo(() => {
    if (!items) return null
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, searchTerm])

  // Paginate local subset (or let backend slice)
  const paginatedItems = useMemo(() => {
    if (!filteredItems) return []
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  return (
    <div className="item-list-container">
      <input
        type="search"
        placeholder="Filter items..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setCurrentPage(1) // Reset to first page on search
        }}
      />

      {/* Render current page data */}
      <ul>
        {paginatedItems.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

      {/* Reusable Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredItems?.length ?? null}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        displayName="items"
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setCurrentPage(1)
        }}
      />
    </div>
  )
}
```

---

## Edge Cases Handled

1. **Backend Loading / Fetch Error**:
   Pass `totalItems={null}` while fetching. Controls render in a disabled state showing `"Showing 0 of 0 {displayName}"`.
2. **Filter Exceeds Bounds**:
   If a user is on page 4 and filters down to 10 items total, `Pagination` clamps display to page 1 and automatically calls `onPageChange(1)` so parent state stays aligned.
3. **Responsive Mobile Viewports**:
   On mobile devices ($\le 640px$), Previous/Next button labels are hidden, preserving clear chevron icons and accessible touch targets.

