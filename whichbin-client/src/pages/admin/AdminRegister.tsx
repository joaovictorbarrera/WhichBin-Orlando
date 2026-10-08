import { useState, type FormEvent } from 'react'
import { FiArrowLeft, FiLock, FiMail } from 'react-icons/fi'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import { registerWithInvitation } from '../../services/userService'
import './AdminRegister.css'

function AdminRegister() {
  const [searchParams] = useSearchParams()
  const userEmail = searchParams.get('userEmail') ?? ''
  const invitationToken = searchParams.get('invitationToken') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  if (!userEmail.trim() || !invitationToken.trim()) {
    return <Navigate to="/" replace />
  }

  if (isComplete) {
    return <Navigate to="/admin/login" replace state={{ showLogin: true }} />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await registerWithInvitation(userEmail, password, invitationToken)
      setIsComplete(true)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to set the password.'
      setError(
        message.toLowerCase().includes('invitation')
          ? message
          : `${message} The invitation token may be invalid or already used.`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout className="admin-register-page" width="wide">
      <div className="admin-register-shell">
        <div className="admin-register-mark" aria-hidden="true"><FiLock /></div>
        <p className="admin-register-eyebrow">WhichBin Orlando</p>
        <h1>Set your password</h1>
        <p className="admin-register-description">
          Create a password to activate your account or restore access.
        </p>

        <form className="admin-register-form" onSubmit={handleSubmit}>
          <label htmlFor="register-email">Email</label>
          <span className="admin-register-input admin-register-email">
            <FiMail aria-hidden="true" />
            <input id="register-email" type="email" value={userEmail} readOnly disabled />
          </span>

          <label htmlFor="register-password">Password</label>
          <span className="admin-register-input">
            <FiLock aria-hidden="true" />
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </span>

          <label htmlFor="register-confirm-password">Confirm Password</label>
          <span className="admin-register-input">
            <FiLock aria-hidden="true" />
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </span>

          {error && <p className="admin-register-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving password...' : 'Set password'}
          </button>
        </form>

        <Link to="/" className="admin-register-back">
          <FiArrowLeft aria-hidden="true" />
          Return to WhichBin Orlando
        </Link>
      </div>
    </PageLayout>
  )
}

export default AdminRegister
