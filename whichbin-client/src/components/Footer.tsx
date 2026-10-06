import { Link } from 'react-router-dom'
import { FaRecycle } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import './Footer.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer role="contentinfo" className="site-footer bg-slate-900 text-slate-100">
      <div className="site-footer-inner max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="site-footer-grid">
          {/* Brand Identity Section */}
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo" aria-label="WhichBin Orlando Home">
              <FaRecycle aria-hidden="true" />
              <span>WhichBin Orlando</span>
            </Link>
            <p className="site-footer-desc">
              Your official community recycling companion. Put every item in its
              right place and build a cleaner, greener Orlando.
            </p>
          </div>

          {/* Internal App Navigation */}
          <div className="site-footer-column">
            <h3>Quick Links</h3>
            <nav aria-label="Footer navigation">
              <ul className="site-footer-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/search">Item Search</Link>
                </li>
                <li>
                  <Link to="/resources">Educational Resources</Link>
                </li>
                <li>
                  <Link to="/announcements">Announcements</Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Official City of Orlando Links */}
          <div className="site-footer-column">
            <h3>City of Orlando Resources</h3>
            <ul className="site-footer-links">
              <li>
                <a
                  href="https://www.orlando.gov/Initiatives/Recycle-Right"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Orlando Recycle Right Guide</span>
                  <FiExternalLink className="site-footer-ext-icon" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.orlando.gov/Trash-Recycling"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Solid Waste Division</span>
                  <FiExternalLink className="site-footer-ext-icon" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.orlando.gov/Trash-Recycling/Get-a-Roll-Cart"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Request Recycling Carts</span>
                  <FiExternalLink className="site-footer-ext-icon" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom / Copyright */}
        <div className="site-footer-bottom">
          <p className="m-0">
            &copy; {currentYear} WhichBin Orlando &bull; City of Orlando Community Initiative.
          </p>
          <p className="m-0 text-xs">
            Committed to high-contrast WCAG 2.1 AA accessibility and environmental stewardship.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
