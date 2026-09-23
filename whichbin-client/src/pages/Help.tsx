import {
  FiArrowRight,
  FiBell,
  FiCheckCircle,
  FiHome,
  FiSearch,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import './Help.css'

function Help() {
  return (
    <PageLayout className="help-page" width="wide">
      <section className="help-intro">
        <p className="help-eyebrow"><FiCheckCircle /> Your guide to WhichBin</p>
        <h1>Make the right disposal choice with confidence.</h1>
        <p>
          Use WhichBin Orlando to search for household items, learn about
          recycling, and keep up with local updates. No account is required.
        </p>
      </section>

      <section className="help-guide" aria-labelledby="help-guide-heading">
        <div className="help-section-heading">
          <span className="help-section-label">How to use it</span>
          <h2 id="help-guide-heading">Start with the question you have.</h2>
        </div>

        <div className="help-guide-list">
          <article className="help-guide-item">
            <div className="help-guide-icon help-guide-icon-search"><FiSearch /></div>
            <div className="help-guide-copy">
              <span className="help-guide-number">01</span>
              <h3>Search for an item</h3>
              <p>
                Enter the name of a household item to find out whether it belongs
                in recycling, trash, or another disposal stream. Follow any
                preparation instructions before you dispose of it.
              </p>
              <Link to="/item-search" className="help-link">
                Search items <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="help-guide-item">
            <div className="help-guide-icon help-guide-icon-resources"><FaRecycle /></div>
            <div className="help-guide-copy">
              <span className="help-guide-number">02</span>
              <h3>Browse recycling resources</h3>
              <p>
                Explore educational topics by category to build better recycling
                habits and understand how different materials should be handled.
                Select a resource to read the full guidance.
              </p>
              <Link to="/resources" className="help-link">
                View resources <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="help-guide-item">
            <div className="help-guide-icon help-guide-icon-updates"><FiBell /></div>
            <div className="help-guide-copy">
              <span className="help-guide-number">03</span>
              <h3>Check current announcements</h3>
              <p>
                Look for updates about recycling, collection services, temporary
                changes, and disposal guidance that may affect Orlando residents.
              </p>
              <Link to="/announcements" className="help-link">
                Read announcements <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="help-tips" aria-labelledby="help-tips-heading">
        <div>
          <span className="help-section-label">A few useful habits</span>
          <h2 id="help-tips-heading">When in doubt, take a closer look.</h2>
        </div>
        <ul>
          <li>Search by the everyday name of the item, then try a more specific term if needed.</li>
          <li>Read the complete disposal instructions, not only the bin classification.</li>
          <li>Check announcements for temporary or local changes before disposal.</li>
        </ul>
      </section>

      <section className="help-footer-cta">
        <div className="help-footer-icon"><FiHome /></div>
        <div>
          <p className="help-footer-kicker">Ready to get started?</p>
          <h2>Find your answer from the home page.</h2>
        </div>
        <Link to="/" className="help-link help-home-link">
          Go to home <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
    </PageLayout>
  )
}

export default Help
