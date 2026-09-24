import { useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, login as loginRequest, type AuthUser } from '../services/authService'
import { setUnauthorizedHandler } from '../services/apiClient'
import { AuthContext } from './AuthState'
import './AuthLoading.css'

const AUTH_STORAGE_KEY = 'whichbin-auth-user'

function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(getStoredUser()))

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setUser(null)
    }

    setUnauthorizedHandler(handleUnauthorized)

    const storedUser = getStoredUser()

    if (storedUser) {
      getCurrentUser()
        .then((currentUser) => {
          setUser({ ...storedUser, ...currentUser })
        })
        .catch(() => {
          // Keep the stored session when the API is temporarily unavailable.
        })
        .finally(() => setIsCheckingSession(false))
    }

    return () => setUnauthorizedHandler(null)
  }, [])

  async function login(email: string, password: string) {
    const authenticatedUser = await loginRequest({ email, password })
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  if (isCheckingSession) {
    return (
      <main className="auth-loading-screen" aria-live="polite">
        <div className="auth-loading-mark" aria-hidden="true" />
        <p>Checking your session...</p>
      </main>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
