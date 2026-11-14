export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export class ApiResponseError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiResponseError'
    this.statusCode = statusCode
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiResponseError && error.statusCode === 404
}
