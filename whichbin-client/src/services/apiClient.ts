import { API_URL } from '../api/config'

const AUTH_STORAGE_KEY = 'whichbin-auth-user'
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  handleUnauthorized = true
) {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
  const authorization = storedUser ? getAuthorizationToken(storedUser) : null
  const headers = new Headers(options.headers)

  if (authorization) {
    headers.set('Authorization', `Bearer ${authorization}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && handleUnauthorized) {
    unauthorizedHandler?.()
  }

  return response
}

function getAuthorizationToken(storedUser: string) {
  try {
    const user = JSON.parse(storedUser) as { authorization?: string }
    return user.authorization ?? null
  } catch {
    return null
  }
}
