import { Link } from 'react-router-dom'
import { FaRecycle } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer role="contentinfo" className="site-footer bg-slate-900 text-slate-100">
      <style>{`
        .site-footer {
          background-color: #0f172a;
          color: #f8fafc;
          width: 100%;
          margin-top: auto;
          border-top: 1px solid #1e293b;
          font-family: inherit;
        }
        .site-footer-inner {
          max-width: 72rem;
          margin: 0 auto;
          padding: 3rem 1.5rem calc(var(--bottom-navigation-height, 3.815rem) + 1.5rem);
        }
        @media (min-width: 1024px) {
          .site-footer-inner {
            padding: 3.5rem 2rem 2.5rem;
          }
        }
        .site-footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 640px) {
          .site-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .site-footer-grid {
            grid-template-columns: 2fr 1fr 1.5fr;
            gap: 3.5rem;
          }
        }
        .site-footer-brand {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .site-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          color: #f8fafc;
          font-size: 1.35rem;
          font-weight: 700;
          text-decoration: none;
        }
        .site-footer-logo:hover {
          color: #4ade80;
        }
        .site-footer-logo svg {
          color: #22c55e;
          font-size: 1.5rem;
        }
        .site-footer-desc {
          margin: 0;
          color: #94a3b8;
          font-size: 0.925rem;
          line-height: 1.6;
          max-width: 24rem;
        }
        .site-footer-column h3 {
          margin: 0 0 1rem;
          color: #f8fafc;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .site-footer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .site-footer-links a {
          color: #cbd5e1;
          font-size: 0.925rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .site-footer-links a:hover,
        .site-footer-links a:focus-visible {
          color: #38bdf8;
          text-decoration: underline;
          text-underline-offset: 0.25rem;
        }
        .site-footer-links a:focus-visible {
          outline: 2px solid #38bdf8;
          outline-offset: 3px;
          border-radius: 2px;
        }
        .site-footer-ext-icon {
          font-size: 0.85rem;
          opacity: 0.75;
          flex-shrink: 0;
        }
        .site-footer-bottom {
          padding-top: 1.75rem;
          border-top: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          text-align: center;
          color: #94a3b8;
          font-size: 0.85rem;
        }
        @media (min-width: 768px) {
          .site-footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
          }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>

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
