import { FiArrowLeft, FiFileText } from 'react-icons/fi'
import { Link, Navigate } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import { useAuth } from '../../context/useAuth'
import './AdminSection.css'

function AdminResources() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <PageLayout className="admin-section-page admin-section-resources" width="wide">
      <Link to="/admin" className="admin-section-back">
        <FiArrowLeft />
        Back to dashboard
      </Link>
      <section className="admin-section-panel">
        <span className="admin-section-icon"><FiFileText /></span>
        <p className="admin-section-eyebrow">Admin workspace</p>
        <h1>Manage Resources</h1>
        <p>Update educational recycling content and guidance.</p>
        <small>Signed in as {user.firstName}. Resource management tools are coming next.</small>
      </section>
    </PageLayout>
  )
}

export default AdminResources
