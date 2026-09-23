import {
  FiArrowRight,
  FiAward,
  FiBell,
  FiCode,
  FiDatabase,
  FiGitBranch,
  FiGithub,
  FiMapPin,
  FiMonitor,
  FiSearch,
  FiServer,
  FiUsers,
} from 'react-icons/fi'
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

      <section className="about-features" aria-label="Public recycling toolkit">
        <div className="about-features-content">
          <div className="about-section-label">A simple public toolkit</div>
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

      <section className="about-information" aria-labelledby="about-information-heading">
        <div className="about-section-label">Project overview</div>
        <div className="about-information-intro">
          <h2 id="about-information-heading">A resident-focused project for clearer recycling decisions.</h2>
          <p>
            WhichBin Orlando explores how local recycling information can be easier
            to find and understand. It complements existing collection services by
            focusing on the question residents ask when an item is in their hands:
            what should I do with this?
          </p>
          <a
            className="about-github-link"
            href="https://github.com/joaovictorbarrera/WhichBin-Orlando"
            target="_blank"
            rel="noreferrer"
          >
            <FiGithub aria-hidden="true" />
            View the project on GitHub
            <FiArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="about-team" aria-labelledby="about-team-heading">
        <div className="about-section-label">The people behind WhichBin</div>
        <div className="about-team-content">
          <h2 id="about-team-heading">Built by a collaborative team.</h2>
          <div className="about-developer-grid">
            {[
              'Joao Barrera',
              'Christopher Ramirez',
              'Alejandro Coro',
              'Todd Uhl',
              'Argenis Santiago',
              'Alicia Cason',
              'CJ VanZile',
            ].map((developer) => (
              <div
                className={`about-developer ${developer === 'Joao Barrera' ? 'about-developer-lead' : ''}`.trim()}
                key={developer}
              >
                {developer === 'Joao Barrera' ? <FiAward aria-hidden="true" /> : <FiUsers aria-hidden="true" />}
                <span>{developer}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-architecture" aria-labelledby="about-architecture-heading">
        <div className="about-section-label">Software architecture</div>
        <div className="about-architecture-content">
          <h2 id="about-architecture-heading">A clear path from question to answer.</h2>
          <div className="about-architecture-grid">
            <article className="about-architecture-layer">
              <FiMonitor aria-hidden="true" />
              <span className="about-layer-number">01</span>
              <h3>React frontend</h3>
              <p>The presentation layer gives residents a simple, responsive way to search and learn.</p>
            </article>
            <article className="about-architecture-layer">
              <FiServer aria-hidden="true" />
              <span className="about-layer-number">02</span>
              <h3>Spring Boot API</h3>
              <p>The application layer processes requests and returns recycling information as JSON.</p>
            </article>
            <article className="about-architecture-layer">
              <FiDatabase aria-hidden="true" />
              <span className="about-layer-number">03</span>
              <h3>MySQL database</h3>
              <p>The data layer stores searchable items, instructions, resources, and announcements.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-technology" aria-labelledby="about-technology-heading">
        <div className="about-section-label">Technology and hosting</div>
        <div className="about-technology-content">
          <h2 id="about-technology-heading">Purposeful tools behind the experience.</h2>
          <div className="about-technology-grid">
            <article>
              <FiCode aria-hidden="true" />
              <h3>Frontend</h3>
              <p>React, developed in Visual Studio Code and hosted with Vercel.</p>
            </article>
            <article>
              <FiGitBranch aria-hidden="true" />
              <h3>Backend</h3>
              <p>Java Spring Boot and Maven, with the API hosted on Railway.</p>
            </article>
            <article>
              <FiDatabase aria-hidden="true" />
              <h3>Collaboration</h3>
              <p>MySQL, Git, and GitHub support persistent data and team delivery.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-experience" aria-labelledby="about-experience-heading">
        <div className="about-section-label">User experience</div>
        <div className="about-experience-content">
          <h2 id="about-experience-heading">Simple enough to use in the moment.</h2>
          <p>
            WhichBin is designed for phones, tablets, and desktop screens with
            readable typography, clear actions, consistent layouts, and accessible
            navigation. The goal is to help someone find an answer and move on,
            without asking residents to create an account or sort through unnecessary detail.
          </p>
        </div>
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
