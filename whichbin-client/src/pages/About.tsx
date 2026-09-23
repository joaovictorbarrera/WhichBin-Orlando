import { FiArrowRight, FiBell, FiCheck, FiHeart, FiMapPin, FiSearch, FiTarget } from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import './About.css'

function About() {
  return (
    <PageLayout className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="about-eyebrow"><FiMapPin /> Made for Orlando</p>
          <h1>Better sorting starts with a little more certainty.</h1>
          <p className="about-lede">
            WhichBin Orlando brings item searches, practical education, and local
            updates together so good intentions can turn into everyday action.
          </p>
          <Link to="/item-search" className="about-primary-action">
            Search for an item
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="about-hero-mark" aria-hidden="true">
          <div className="about-mark-circle about-mark-circle-back" />
          <div className="about-mark-circle about-mark-circle-front">
            <FaRecycle />
          </div>
        </div>
      </section>

      <section className="about-story" aria-labelledby="about-story-heading">
        <div className="about-section-label">Why WhichBin exists</div>
        <div className="about-story-content">
          <h2 id="about-story-heading">The right answer should be easy to find.</h2>
          <div className="about-story-copy">
            <p>
              Recycling rules can vary by place, and the wrong guess can send a
              useful material to the landfill. Orlando already provides collection
              schedules through Orlando Collects; WhichBin focuses on the decision
              that comes before that: what to do with a specific item.
            </p>
            <p>
              Search for an item, learn from clear recycling resources, and check
              announcements when local guidance changes. No account is required.
            </p>
          </div>
        </div>
      </section>

      <section className="about-features" aria-labelledby="about-features-heading">
        <div className="about-section-label">A simple public toolkit</div>
        <div className="about-features-content">
          <h2 id="about-features-heading">Everything you need for the next decision.</h2>
          <div className="about-feature-links">
            <Link to="/item-search" className="about-feature-link">
              <FiSearch />
              <span><strong>Search items</strong><small>Get a disposal answer</small></span>
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link to="/resources" className="about-feature-link">
              <FaRecycle />
              <span><strong>Learn the basics</strong><small>Browse recycling resources</small></span>
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link to="/announcements" className="about-feature-link">
              <FiBell />
              <span><strong>See what is changing</strong><small>Read local announcements</small></span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="about-pillars" aria-label="WhichBin principles">
        <article className="about-pillar">
          <span className="about-pillar-icon"><FiTarget /></span>
          <span className="about-pillar-number">01</span>
          <h2>Local first</h2>
          <p>Guidance shaped around Orlando households and the choices they make every day.</p>
        </article>
        <article className="about-pillar">
          <span className="about-pillar-icon"><FiCheck /></span>
          <span className="about-pillar-number">02</span>
          <h2>Clear by design</h2>
          <p>Useful answers without the jargon, uncertainty, or extra digging.</p>
        </article>
        <article className="about-pillar">
          <span className="about-pillar-icon"><FiHeart /></span>
          <span className="about-pillar-number">03</span>
          <h2>Better together</h2>
          <p>Small decisions add up when a whole community has the same information.</p>
        </article>
      </section>

      <section className="about-cta">
        <div>
          <p className="about-cta-kicker">Ready when you are</p>
          <h2>Make the next disposal decision a little easier.</h2>
        </div>
        <Link to="/item-search" className="about-cta-link">
          Search an item
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
    </PageLayout>
  )
}

export default About
