import { useEffect, useState } from 'react';
import { getApiInfo, type ApiInfo } from './services/apiService';
import './App.css';

function App() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApiInfo()
      .then(setApiInfo)
      .finally(() => setLoading(false));
  }, []);

  const status = loading
    ? 'Loading...'
    : apiInfo
      ? `Online - Version ${apiInfo.version}`
      : 'Offline';

  return (
    <main className="app">
      <div className="status-card">
        <h1>WhichBin Orlando</h1>
        <p className="subtitle">Development Environment</p>

        <div className="api-status">
          <span
            className={`status-dot ${
              loading ? 'loading' : apiInfo ? 'online' : 'offline'
            }`}
          />

          <span>
            <strong>API Status:</strong> {status}
          </span>
        </div>
      </div>
    </main>
  );
}

export default App;
