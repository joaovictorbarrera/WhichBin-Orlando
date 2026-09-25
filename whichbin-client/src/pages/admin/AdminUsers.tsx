import { FiArrowLeft, FiUsers } from 'react-icons/fi'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import { useAuth } from '../../context/useAuth'
import './AdminSection.css'

function AdminUsers() {
  const { user } = useAuth()
  const authenticatedUser = user!

  return <AdminUsersView name={authenticatedUser.firstName} />
}

function AdminUsersView({ name }: { name: string }) {
  return (
    <AdminSectionView
      name={name}
      title="Manage Users"
      description="Review administrator accounts and access."
      icon={<FiUsers />}
      className="admin-section-users"
      note="User management tools are coming next."
    />
  )
}

function AdminSectionView({
  name,
  title,
  description,
  icon,
  className,
  note,
}: {
  name: string
  title: string
  description: string
  icon: ReactNode
  className: string
  note: string
}) {
  return (
    <PageLayout className={`admin-section-page ${className}`} width="wide">
      <Link to="/admin" className="admin-section-back">
        <FiArrowLeft />
        Back to dashboard
      </Link>
      <section className="admin-section-panel">
        <span className="admin-section-icon">{icon}</span>
        <p className="admin-section-eyebrow">Admin workspace</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <small>Signed in as {name}. {note}</small>
      </section>
    </PageLayout>
  )
}

export default AdminUsers
