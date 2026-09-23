import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiSearch,
  FiBell,
  FiMenu,
  FiX,
  FiInfo,
  FiHelpCircle,
  FiSettings,
  FiLock,
  FiActivity,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import './Navigation.css'

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <>
      <header className="top-navigation">
        <NavLink to="/" end className="app-title" onClick={closeMenu}>
          WhichBin Orlando
        </NavLink>

        <nav className="desktop-navigation" aria-label="Primary navigation">
          <NavLink to="/" end className="desktop-nav-item" onClick={closeMenu}>
            <FiHome />
            <span>Home</span>
          </NavLink>

          <NavLink to="/item-search" className="desktop-nav-item" onClick={closeMenu}>
            <FiSearch />
            <span>Search</span>
          </NavLink>

          <NavLink to="/resources" className="desktop-nav-item" onClick={closeMenu}>
            <FaRecycle />
            <span>Resources</span>
          </NavLink>

          <NavLink to="/announcements" className="desktop-nav-item" onClick={closeMenu}>
            <FiBell />
            <span>Announcements</span>
          </NavLink>
        </nav>

        <div className="menu-container" ref={menuRef}>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <NavLink to="/about" onClick={closeMenu}>
                <FiInfo />
                <span>About</span>
              </NavLink>

              <NavLink to="/help" onClick={closeMenu}>
                <FiHelpCircle />
                <span>Help / How to Use</span>
              </NavLink>

              <NavLink to="/settings" onClick={closeMenu}>
                <FiSettings />
                <span>Settings</span>
              </NavLink>

              <NavLink to="/admin/login" onClick={closeMenu}>
                <FiLock />
                <span>Admin Login</span>
              </NavLink>

              <NavLink to="/apistatus" onClick={closeMenu}>
                <FiActivity />
                <span>API Status</span>
              </NavLink>
            </div>
          )}
        </div>
      </header>

      <nav className="bottom-navigation">
        <NavLink to="/" end className="nav-item">
          <FiHome />
          <span>Home</span>
        </NavLink>

        <NavLink to="/item-search" className="nav-item">
          <FiSearch />
          <span>Search</span>
        </NavLink>

        <NavLink to="/resources" className="nav-item">
          <FaRecycle />
          <span>Resources</span>
        </NavLink>

        <NavLink to="/announcements" className="nav-item">
          <FiBell />
          <span>Announcements</span>
        </NavLink>

      </nav>
    </>
  )
}

export default Navigation
