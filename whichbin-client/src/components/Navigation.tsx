import { Link } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <>
      <header className="top-navigation">
        <Link to="/" className="app-title">
          WhichBin Orlando
        </Link>

        <button className="menu-button">
          ☰
        </button>
      </header>

      <nav className="bottom-navigation">
        <Link to="/" className="nav-item">
          <span>⌂</span>
          <span>Home</span>
        </Link>

        <Link to="/item-search" className="nav-item">
          <span>⌕</span>
          <span>Search</span>
        </Link>

        <Link to="/resources" className="nav-item">
          <span>♻</span>
          <span>Resources</span>
        </Link>

        <Link to="/announcements" className="nav-item">
          <span>📢</span>
          <span>Announcements</span>
        </Link>
      </nav>
    </>
  )
}

export default Navigation