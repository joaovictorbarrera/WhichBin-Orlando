import { useState, type FormEvent } from 'react'
import { FiArrowLeft, FiLock, FiMail } from 'react-icons/fi'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import PageLayout from '../components/PageLayout'
import './AdminLogin.css'

function AdminLogin() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout className="admin-login-page" width="wide">
      <div className="admin-login-shell">
        <div className="admin-login-mark" aria-hidden="true">
          <FiLock />
        </div>

        <div className="admin-login-copy">
          <p className="admin-login-eyebrow">WhichBin Orlando</p>
          <h1>Admin access</h1>
          <p>
            Sign in to manage the recycling information that powers the public
            WhichBin experience.
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">
            Email address
            <span className="admin-input-wrap">
              <FiMail aria-hidden="true" />
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </span>
          </label>

          <label htmlFor="admin-password">
            Password
            <span className="admin-input-wrap">
              <FiLock aria-hidden="true" />
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </span>
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
        </form>

        <Link to="/" className="admin-back-link">
          <FiArrowLeft aria-hidden="true" />
          Return to WhichBin Orlando
        </Link>
      </div>
    </PageLayout>
  )
}

export default AdminLogin
