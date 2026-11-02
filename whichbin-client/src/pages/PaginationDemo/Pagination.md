# THESE ARE EXPECTATIONS OF PAGINATION COMPONENT AS IS NOW. THIS WILL NEED TO BE THOROUGHLY REVIEWED AND REVISED ONCE CHANGES REQUESTED IN PR ARE IN EFFECT.
# Pagination component guide

This guide describes the component as it currently works in [`src/components/Pagination.tsx`](../../components/Pagination.tsx). Its styles are in `Pagination.css`.

## Open the demo

The demo route is protected and is not linked in the app's navigation. Sign in through the admin login first, then manually enter `/pagination-demo` in the browser address bar (URL hop). If you are not authenticated, the app redirects you to `/admin/login`.

The demo in [`PaginationDemo.tsx`](./PaginationDemo.tsx) uses a one-second simulated API request, dummy data, a suggested-bin filter, and the page-size selector to demonstrate the component.

## What the component does

`Pagination` is a controlled UI component. It renders:

- Previous and Next buttons.
- Numbered page buttons, with ellipses when the page range is abbreviated.
- A page/item status message.
- A rows-per-page selector when the required props for that selector are supplied.

It calls the callbacks when the user chooses a page or page size. It does not own pagination state, fetch or filter records, calculate the total item/page counts, show a loading or error state, or render the feature's data rows. Those are responsibilities of the feature using it.

## Props expected by the component

| Prop | Required? | Default in the component | What it expects / does |
| --- | --- | --- | --- |
| `currentPage: number` | Yes | None | Current one-based page number. The caller owns this value and updates it when `onPageChange` is called. |
| `totalPages: number` | Yes | None | Total pages in the current result set. The caller calculates and supplies it. The component uses at least `1` for the displayed page range, but callers should provide a valid value. |
| `onPageChange: (page: number) => void` | Yes | None | Callback for page navigation. Receives the selected page, `currentPage - 1` for Previous, or `currentPage + 1` for Next. When page size changes, it is called with `1`. The caller must update its page state and load/display the corresponding data. |
| `totalItems?: number` | No | `undefined` | Total matching item count across all pages. When omitted, the status reads “Page X of Y”. When supplied, it includes the count. |
| `pageSize?: number` | No | `undefined` | Current number of items per page. With a positive value and `totalItems`, the status shows the visible item range, such as “Showing 11–20 of 47 items.” |
| `pageSizeOptions?: number[]` | No | `[10, 20, 50]` | Choices in the page-size selector. If the current `pageSize` is not present, the component adds it and sorts the choices numerically. This prop has no visible effect unless the selector is enabled. |
| `onPageSizeChange?: (pageSize: number) => void` | No | `undefined` | Callback invoked with the selected page size. The component renders the selector only when both this callback and `pageSize` are provided. |
| `siblingCount?: number` | No | `1` | Number of numbered page buttons to show on each side of the current page in an abbreviated range. |
| `className?: string` | No | `''` | Extra CSS class appended to the pagination navigation container. |

The minimum required props are `currentPage`, `totalPages`, and `onPageChange`. There are no defaults for these required props.

### Page-size selector behavior

The selector appears only when **both** `pageSize` and `onPageSizeChange` are provided. On a selection, the component calls:

1. `onPageSizeChange(selectedPageSize)`.
2. `onPageChange(1)`.

The caller still owns both state values: it must update `pageSize` in the first callback and `currentPage` in the second. The component does not update those props internally. When a selector is not rendered, `pageSizeOptions` is not used.

### Status text behavior

- With no `totalItems`, it says “Page X of Y”.
- With `totalItems` but no positive `pageSize`, it says “Page X of Y (N items)”.
- With `totalItems` and a positive `pageSize`, it shows the item range.
- When `totalItems` is `0` and `pageSize` is positive, it says “Showing 0 of 0 items”.

`totalItems` can be `undefined` before an API response arrives. The component then shows its page-only status; it does not display a loading indicator or hide itself automatically.

## Responsibilities when integrating it

### The caller owns

1. **State:** Maintain `currentPage` and, if using the selector, `pageSize`. Pass their current values as props. This is a controlled component.
2. **Data requests and rows:** Fetch the selected page using the current page/page size and render the returned rows. The component does not fetch or slice the data.
3. **Counts:** Supply `totalItems` when available and calculate `totalPages` for the current result set, commonly `Math.max(1, Math.ceil(totalItems / pageSize))`. Include active filters/search terms when determining the result count.
4. **Callback state updates:** In `onPageChange`, set the page and load/render that page. In `onPageSizeChange`, set the page size and load/render results with the new size. The component itself calls `onPageChange(1)` after a page-size selection.
5. **Filter/search changes:** Reset to page `1` and request the newly filtered results when a filter/search changes. The pagination component does not know about filters.
6. **Loading, empty, and error states:** Show these in the feature's data area. Pagination has no loading or error prop and does not disable controls while a request is pending.
7. **Request consistency:** Prevent older asynchronous responses from replacing results for a newer page, page size, or filter (for example, cancel requests or ignore stale responses).

### The component owns

- Rendering the navigation and optional page-size selector.
- Choosing the displayed page range and adding ellipses for large ranges.
- Showing the current page and status text.
- Disabling Previous/Next when `currentPage` is at a boundary or `totalPages <= 1`.
- Calling the provided callbacks in response to user actions, including the page-1 callback after a page-size selection.

The component emits requested changes; the caller must update state and pass the new props back for the display to change.

## Basic usage example

This example shows the controlled-state wiring. A real feature also needs to load its rows and `totalItems` whenever the page, page size, or filters change.

```tsx
const [currentPage, setCurrentPage] = useState(1)
const [pageSize, setPageSize] = useState(20)
const [totalItems, setTotalItems] = useState<number>()

const totalPages =
  totalItems === undefined
    ? 1
    : Math.max(1, Math.ceil(totalItems / pageSize))

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  totalItems={totalItems}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
/>
```

In the example, `setPageSize` handles the `onPageSizeChange` callback and `setCurrentPage` handles both navigation and the component's page-1 request after a size change. A filter handler still needs to call `setCurrentPage(1)` because filters are outside the component's responsibilities.

The component displays a minimum of one page even for an empty result set. With a zero `totalItems` and a positive `pageSize`, its status reads “Showing 0 of 0 items.”

## Demo behavior

The demo simulates server-side pagination: each request waits one second and returns the selected page plus the matching `totalItems`. The total is unknown until the initial response arrives. Changing the suggested-bin filter resets the page in the caller; changing the page size makes the component call both callbacks described above.
