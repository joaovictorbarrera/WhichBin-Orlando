import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
        <Link to="/" className="app-title" onClick={closeMenu}>
          WhichBin Orlando
        </Link>

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
              <Link to="/about" onClick={closeMenu}>
                <FiInfo />
                <span>About</span>
              </Link>

              <Link to="/help" onClick={closeMenu}>
                <FiHelpCircle />
                <span>Help / How to Use</span>
              </Link>

              <Link to="/settings" onClick={closeMenu}>
                <FiSettings />
                <span>Settings</span>
              </Link>

              <Link to="/admin/login" onClick={closeMenu}>
                <FiLock />
                <span>Admin Login</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <nav className="bottom-navigation">
        <Link to="/" className="nav-item">
          <FiHome />
          <span>Home</span>
        </Link>

        <Link to="/item-search" className="nav-item">
          <FiSearch />
          <span>Search</span>
        </Link>

        <Link to="/resources" className="nav-item">
          <FaRecycle />
          <span>Resources</span>
        </Link>

        <Link to="/announcements" className="nav-item">
          <FiBell />
          <span>Announcements</span>
        </Link>
      </nav>
    </>
  )
}

export default Navigation