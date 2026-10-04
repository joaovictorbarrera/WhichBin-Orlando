import type { ReactNode } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { FiHome, FiSearch, FiBell } from 'react-icons/fi'
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

interface LayoutProps {
  children?: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-shell flex min-h-screen flex-col">
      <style>{`
        .layout-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
        }
        .layout-main-content {
          flex: 1 0 auto;
          width: 100%;
        }
      `}</style>
      <main className="layout-main-content flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default Layout
