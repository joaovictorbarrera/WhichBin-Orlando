import { FiAlertTriangle, FiInfo } from 'react-icons/fi'
import './DetailStatus.css'

export type DetailStatusType = 'loading' | 'not-found' | 'failed'

type DetailStatusProps = {
  featureName: string
  status: DetailStatusType
  onRetry: () => void
}

function DetailStatus({ featureName, status, onRetry }: DetailStatusProps) {
  const titleFeatureName =
    featureName.charAt(0).toUpperCase() + featureName.slice(1)

  if (status === 'loading') {
    return (
      <div className="detail-status-card" role="status">
        <div className="detail-status-spinner" aria-hidden="true" />
        <p>Loading {featureName} details...</p>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="detail-status-card" role="alert">
        <FiInfo className="detail-status-icon" aria-hidden="true" />
        <h1>{titleFeatureName} Not Found</h1>
        <p>The requested {featureName} could not be found.</p>
      </div>
    )
  }

  return (
    <div className="detail-status-card" role="alert">
      <FiAlertTriangle className="detail-status-icon" aria-hidden="true" />
      <h1>Unexpected Error</h1>
      <p>
        An error occurred loading this {featureName}. Check your connection and
        try again.
      </p>
      <button className="detail-status-retry" type="button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  )
}

export default DetailStatus
