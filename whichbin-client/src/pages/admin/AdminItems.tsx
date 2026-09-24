import { FiArrowLeft, FiBox } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import { useAuth } from '../../context/useAuth'
import './AdminSection.css'

function AdminItems() {
  const { user } = useAuth()
  const authenticatedUser = user!

  return (
    <PageLayout className="admin-section-page admin-section-items" width="wide">
      <Link to="/admin" className="admin-section-back">
        <FiArrowLeft />
        Back to dashboard
      </Link>
      <section className="admin-section-panel">
        <span className="admin-section-icon"><FiBox /></span>
        <p className="admin-section-eyebrow">Admin workspace</p>
        <h1>Manage Items</h1>
        <p>Maintain searchable household items and disposal classifications.</p>
        <small>Signed in as {authenticatedUser.firstName}. Item management tools are coming next.</small>
      </section>
    </PageLayout>
  )
}

export default AdminItems
