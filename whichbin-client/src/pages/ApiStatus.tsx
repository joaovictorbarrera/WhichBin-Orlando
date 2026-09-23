import { useEffect, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { getApiInfo, type ApiInfo } from '../services/apiService';
import PageLayout from '../components/PageLayout';
import './ApiStatus.css';

function ApiStatus() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApiInfo()
      .then(setApiInfo)
      .finally(() => setLoading(false));
  }, []);

  const status = loading
    ? 'Checking connection...'
    : apiInfo
      ? `Online - Version ${apiInfo.version}`
      : 'Offline';

  return (
    <PageLayout className="api-status-page">
      <section className="api-status-panel">
        <div className="api-status-icon" aria-hidden="true"><FiActivity /></div>
        <p className="api-status-eyebrow">System information</p>
        <h1>API status</h1>
        <p className="api-status-description">
          A quick look at the connection powering WhichBin Orlando.
        </p>
        <div className="api-status-result">
          <span
            className={`status-dot ${
              loading ? 'loading' : apiInfo ? 'online' : 'offline'
            }`}
          />
          <span><strong>Connection:</strong> {status}</span>
        </div>
      </section>
    </PageLayout>
  );
}

export default ApiStatus;
