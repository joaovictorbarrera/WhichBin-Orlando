import { FiArrowRight, FiBell, FiMapPin, FiSearch } from 'react-icons/fi';
import { FaRecycle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import './Home.css';

function Home() {
  return (
    <PageLayout className="home-page">
      <section className="home-hero">
        <div className="home-copy">
          <p className="home-eyebrow"><FiMapPin /> Orlando, Florida</p>
          <h1>Put every item in its right place.</h1>
          <p className="home-intro">
            Search an item, understand how to handle it, and keep up with local
            recycling guidance in one place.
          </p>
          <div className="home-actions">
            <Link to="/item-search" className="home-primary-action">
              Search for an item
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link to="/resources" className="home-secondary-action">
              Explore resources
            </Link>
          </div>
        </div>

        <div className="home-illustration" aria-hidden="true">
          <div className="illustration-ring illustration-ring-large" />
          <div className="illustration-ring illustration-ring-small" />
          <div className="recycle-mark"><FaRecycle /></div>
          <span className="illustration-label label-top">reduce</span>
          <span className="illustration-label label-right">reuse</span>
          <span className="illustration-label label-bottom">recycle</span>
        </div>
      </section>

      <section className="home-toolkit" aria-label="Public recycling toolkit">
        <div className="home-toolkit-label">A simple public toolkit</div>
        <div className="home-toolkit-links">
          <Link to="/item-search" className="home-toolkit-link">
            <FiSearch aria-hidden="true" />
            <span><strong>Search with confidence</strong><small>Find the right disposal answer</small></span>
            <FiArrowRight aria-hidden="true" />
          </Link>
          <Link to="/resources" className="home-toolkit-link">
            <FaRecycle aria-hidden="true" />
            <span><strong>Learn what helps</strong><small>Browse recycling resources</small></span>
            <FiArrowRight aria-hidden="true" />
          </Link>
          <Link to="/announcements" className="home-toolkit-link">
            <FiBell aria-hidden="true" />
            <span><strong>Stay up to date</strong><small>See local recycling updates</small></span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}

export default Home;
