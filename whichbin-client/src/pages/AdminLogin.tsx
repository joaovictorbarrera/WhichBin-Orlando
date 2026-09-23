import { FiArrowLeft, FiLock, FiMail } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import './AdminLogin.css'

function AdminLogin() {
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

        <form className="admin-login-form">
          <label htmlFor="admin-email">
            Email address
            <span className="admin-input-wrap">
              <FiMail aria-hidden="true" />
              <input id="admin-email" name="email" type="email" placeholder="you@example.com" />
            </span>
          </label>

          <label htmlFor="admin-password">
            Password
            <span className="admin-input-wrap">
              <FiLock aria-hidden="true" />
              <input id="admin-password" name="password" type="password" placeholder="Enter your password" />
            </span>
          </label>

          <button type="button" disabled>
            Sign in
          </button>
          <p className="admin-login-note">Authentication will be available in a future release.</p>
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
