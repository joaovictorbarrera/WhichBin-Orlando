import type { ReactNode } from 'react'
import './PageLayout.css'
import { NavLink, Outlet } from 'react-router-dom'
import { FiBell, FiHome, FiSearch } from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import Footer from './Footer'

export function BottomNav() {
  return (
    <nav className="bottom-navigation" aria-label="Mobile navigation">
      <NavLink to="/" end className="nav-item">
        <FiHome aria-hidden="true" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/search" className="nav-item">
        <FiSearch aria-hidden="true" />
        <span>Search</span>
      </NavLink>

      <NavLink to="/resources" className="nav-item">
        <FaRecycle aria-hidden="true" />
        <span>Resources</span>
      </NavLink>

      <NavLink to="/announcements" className="nav-item">
        <FiBell aria-hidden="true" />
        <span>Announcements</span>
      </NavLink>
    </nav>
  )
}

type PageLayoutProps = {
  children: ReactNode
  className?: string
  width?: 'narrow' | 'wide' | 'full'
}

function PageLayout({ children, className = '', width = 'full' }: PageLayoutProps) {
  return (
    <div className="layout-shell flex min-h-screen flex-col">
      <main className={`layout-main-content flex-1 page-layout page-layout-${width} ${className}`}>
        {children || <Outlet />}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default PageLayout
