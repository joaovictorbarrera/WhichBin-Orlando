import { FiBell, FiBox, FiFileText, FiUsers } from 'react-icons/fi'
import { Link, Navigate } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import { useAuth } from '../../context/useAuth'
import './AdminDashboard.css'

const adminLinks = [
  {
    path: '/admin/users',
    label: 'Manage Users',
    description: 'Review administrator accounts.',
    icon: FiUsers,
    color: 'users',
  },
  {
    path: '/admin/items',
    label: 'Manage Items',
    description: 'Maintain item guidance and classifications.',
    icon: FiBox,
    color: 'items',
  },
  {
    path: '/admin/resources',
    label: 'Manage Resources',
    description: 'Update educational recycling content.',
    icon: FiFileText,
    color: 'resources',
  },
  {
    path: '/admin/announcements',
    label: 'Manage Announcements',
    description: 'Publish resident-facing updates.',
    icon: FiBell,
    color: 'announcements',
  },
]

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <PageLayout className="admin-dashboard-page" width="wide">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-dashboard-eyebrow">Admin dashboard</p>
          <h1>Good to see you, {user.firstName}.</h1>
          <p>Choose an area to manage WhichBin Orlando content.</p>
        </div>
        <div className="admin-dashboard-user">
          <span>Signed in as</span>
          <strong>{user.firstName} {user.lastName}</strong>
          <small>{user.email}</small>
        </div>
      </header>
      <div className="admin-dashboard-grid">
        {adminLinks.map(({ path, label, description, icon: Icon, color }) => (
          <Link to={path} className="admin-dashboard-card" key={path}>
            <span className={`admin-dashboard-card-icon admin-dashboard-card-icon-${color}`}>
              <Icon aria-hidden="true" />
            </span>
            <span className="admin-dashboard-card-copy">
              <strong>{label}</strong>
              <small>{description}</small>
            </span>
            <span className="admin-dashboard-card-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}

export default AdminDashboard
