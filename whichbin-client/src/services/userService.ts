import { apiFetch } from './apiClient'

export type ManagedUser = {
  id: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
  updatedAt: string
}

export type UserInput = Pick<ManagedUser, 'firstName' | 'lastName' | 'email'>

export type CreatedUser = ManagedUser & {
  invitationToken: string
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const payload: unknown = await response.json()
    if (typeof payload === 'object' && payload !== null) {
      if ('message' in payload && typeof payload.message === 'string') {
        return payload.message
      }
      if ('detail' in payload && typeof payload.detail === 'string') {
        return payload.detail
      }
    }
  } catch {
    // The response may have no JSON body.
  }

  return fallback
}

async function requireSuccessfulResponse(response: Response, fallback: string) {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback))
  }
}

export async function fetchUsers(): Promise<ManagedUser[]> {
  const response = await apiFetch('users')
  await requireSuccessfulResponse(response, 'Unable to load users.')
  return (await response.json()) as ManagedUser[]
}

export async function createUser(input: UserInput): Promise<CreatedUser> {
  const response = await apiFetch('users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  await requireSuccessfulResponse(response, 'Unable to create this user.')
  return (await response.json()) as CreatedUser
}

export async function updateUser(id: number, input: UserInput): Promise<ManagedUser> {
  const response = await apiFetch(`users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  await requireSuccessfulResponse(response, 'Unable to update this user.')
  return (await response.json()) as ManagedUser
}

export async function deleteUser(id: number): Promise<void> {
  const response = await apiFetch(`users/${id}`, { method: 'DELETE' })
  await requireSuccessfulResponse(response, 'Unable to delete this user.')
}

export async function createPasswordResetLink(id: number): Promise<string> {
  const response = await apiFetch('auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id }),
  })
  await requireSuccessfulResponse(response, 'Unable to generate a password reset link.')
  const payload = (await response.json()) as { invitationToken: string }
  return payload.invitationToken
}

export async function registerWithInvitation(
  email: string,
  password: string,
  invitationToken: string
): Promise<void> {
  const response = await apiFetch('auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, invitationToken }),
  })
  await requireSuccessfulResponse(
    response,
    'Unable to set the password. The invitation token may be invalid or already used.'
  )
}
