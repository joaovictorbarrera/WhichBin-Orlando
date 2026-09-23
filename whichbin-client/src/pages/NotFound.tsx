import { FiArrowLeft, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-art" aria-hidden="true">
        <span className="not-found-number">4</span>
        <FiMapPin className="not-found-pin" />
        <span className="not-found-number">4</span>
      </div>

      <div className="not-found-content">
        <p className="not-found-eyebrow">Wrong turn</p>
        <h1>That page is not on our route.</h1>
        <p>
          The address you entered does not lead anywhere in WhichBin Orlando.
          Let&apos;s get you back to a familiar place.
        </p>
        <Link to="/" className="not-found-home-link">
          <FiArrowLeft aria-hidden="true" />
          Return to home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
