export interface PaginatedResponse<T> {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  items: T[]
}
