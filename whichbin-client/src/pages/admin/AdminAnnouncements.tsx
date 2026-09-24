import { FiArrowLeft, FiBell } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import { useAuth } from '../../context/useAuth'
import './AdminSection.css'

function AdminAnnouncements() {
  const { user } = useAuth()
  const authenticatedUser = user!

  return (
    <PageLayout className="admin-section-page admin-section-announcements" width="wide">
      <Link to="/admin" className="admin-section-back">
        <FiArrowLeft />
        Back to dashboard
      </Link>
      <section className="admin-section-panel">
        <span className="admin-section-icon"><FiBell /></span>
        <p className="admin-section-eyebrow">Admin workspace</p>
        <h1>Manage Announcements</h1>
        <p>Publish and update resident-facing recycling announcements.</p>
        <small>Signed in as {authenticatedUser.firstName}. Announcement tools are coming next.</small>
      </section>
    </PageLayout>
  )
}

export default AdminAnnouncements
