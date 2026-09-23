import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import { FaRecycle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-copy">
          <p className="home-eyebrow"><FiMapPin /> Orlando, Florida</p>
          <h1>Put every item in its right place.</h1>
          <p className="home-intro">
            A clearer way to find the right bin for what you are throwing away,
            right here in Orlando.
          </p>
          <div className="home-actions">
            <Link to="/resources" className="home-primary-action">
              Explore recycling resources
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link to="/apistatus" className="home-secondary-action">
              View API status
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
          <h2>Know before you throw</h2>
          <p>Make confident choices with simple, local guidance.</p>
        </article>
        <article>
          <span className="highlight-number">02</span>
          <h2>Keep Orlando cleaner</h2>
          <p>Small sorting decisions add up to a healthier community.</p>
        </article>
      </section>
    </main>
  );
}

export default Home;
