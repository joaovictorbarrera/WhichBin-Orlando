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

      <section className="home-highlights" aria-label="WhichBin highlights">
        <article>
          <span className="highlight-number">01</span>
          <FiSearch className="highlight-icon" aria-hidden="true" />
          <h2>Search with confidence</h2>
          <p>Find the right disposal category and instructions for an item.</p>
        </article>
        <article>
          <span className="highlight-number">02</span>
          <FaRecycle className="highlight-icon" aria-hidden="true" />
          <h2>Learn what helps</h2>
          <p>Build better habits with clear recycling education.</p>
        </article>
        <article>
          <span className="highlight-number">03</span>
          <FiBell className="highlight-icon" aria-hidden="true" />
          <h2>Stay up to date</h2>
          <p>See announcements about local changes and disposal guidance.</p>
        </article>
      </section>
    </PageLayout>
  );
}

export default Home;
