import { apiFetch } from './apiClient'

export type AuthUser = {
  id: number
  firstName: string
  lastName: string
  email: string
  authorization: string
}

export type CurrentUser = Omit<AuthUser, 'authorization'>

type LoginCredentials = {
  email: string
  password: string
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await apiFetch('auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Unable to sign in with those credentials.')
  }

  return (await response.json()) as AuthUser
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiFetch('auth/me')

  if (!response.ok) {
    throw new Error('Unable to validate the current session.')
  }

  return (await response.json()) as CurrentUser
}

export async function logout(): Promise<void> {
  await apiFetch('auth/logout', { method: 'POST' }, false)
}
