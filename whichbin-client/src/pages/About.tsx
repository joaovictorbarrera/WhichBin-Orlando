import { FiArrowRight, FiCheck, FiHeart, FiMapPin, FiTarget } from 'react-icons/fi'
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
            WhichBin Orlando makes it easier to decide what belongs in each bin,
            so good intentions can turn into everyday action.
          </p>
          <Link to="/resources" className="about-primary-action">
            Browse recycling resources
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
              useful material to the landfill. WhichBin brings local guidance into
              one simple, approachable place.
            </p>
            <p>
              We are building a calmer way to learn, search, and make a better
              choice at the moment it matters: when an item is in your hand.
            </p>
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
          <h2>Find the right home for your next item.</h2>
        </div>
        <Link to="/resources" className="about-cta-link">
          Explore resources
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
    </PageLayout>
  )
}

export default About
