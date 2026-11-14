import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiBell,
  FiCalendar,
} from 'react-icons/fi'
import DetailStatus, {
  type DetailStatusType,
} from '../../components/DetailStatus'
import { isNotFoundError } from '../../helpers/ErrorHelper'
import {
  getAnnouncementById,
  type Announcement,
} from '../../services/announcementService'
import PageLayout from '../../components/PageLayout'
import './AnnouncementDetails.css'

type AnnouncementDetailState = DetailStatusType | 'success'

type AnnouncementDetailViewState = {
  announcementId: string | undefined
  status: AnnouncementDetailState
  announcement: Announcement | null
}

function formatType(type: string) {
  return type.replaceAll('_', ' ')
}

function formatDateTime(dateTime: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime))
}

function AnnouncementDetails() {
  const { announcementId } = useParams()

  const [detailState, setDetailState] = useState<AnnouncementDetailViewState>({
    announcementId,
    status: announcementId ? 'loading' : 'failed',
    announcement: null,
  })
  const [retryCount, setRetryCount] = useState(0)
  const status =
    detailState.announcementId === announcementId
      ? detailState.status
      : announcementId
        ? 'loading'
        : 'failed'
  const announcement =
    detailState.announcementId === announcementId
      ? detailState.announcement
      : null

  useEffect(() => {
    if (!announcementId) {
      return
    }

    let isMounted = true

    getAnnouncementById(announcementId)
      .then((data) => {
        if (isMounted) {
          setDetailState({
            announcementId,
            status: 'success',
            announcement: data,
          })
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setDetailState({
            announcementId,
            status: isNotFoundError(error) ? 'not-found' : 'failed',
            announcement: null,
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [announcementId, retryCount])

  if (status !== 'success' || !announcement) {
    return (
      <PageLayout className="announcement-details-page" width="wide">
        <Link className="announcement-back-link" to="/announcements">
          <FiArrowLeft aria-hidden="true" />
          Back to Announcements
        </Link>

        <DetailStatus
          featureName="announcement"
          status={status === 'success' ? 'failed' : status}
          onRetry={() => {
            setDetailState({
              announcementId,
              status: 'loading',
              announcement: null,
            })
            setRetryCount((count) => count + 1)
          }}
        />
      </PageLayout>
    )
  }

  const typeClass = announcement.type
    .toLowerCase()
    .replaceAll('_', '-')

  return (
    <PageLayout className="announcement-details-page" width="wide">
      <Link className="announcement-back-link" to="/announcements">
        <FiArrowLeft aria-hidden="true" />
        Back to Announcements
      </Link>

      <article
        className={`announcement-details-card announcement-details-${typeClass}`}
      >
        <div className="announcement-details-heading">
          <div className="announcement-details-icon">
            <FiBell aria-hidden="true" />
          </div>

          <div>
            <span className="announcement-details-type">
              {formatType(announcement.type)}
            </span>

            <h1>{announcement.title}</h1>
          </div>
        </div>

        <p className="announcement-details-message">
          {announcement.message}
        </p>

        <div className="announcement-date-section">
          <div className="announcement-date-item">
            <FiCalendar aria-hidden="true" />

            <div>
              <span>Start Date & Time</span>
              <strong>{formatDateTime(announcement.startDate)}</strong>
            </div>
          </div>

          {announcement.endDate && (
            <div className="announcement-date-item">
              <FiCalendar aria-hidden="true" />

              <div>
                <span>End Date & Time</span>
                <strong>{formatDateTime(announcement.endDate)}</strong>
              </div>
            </div>
          )}
        </div>
      </article>
    </PageLayout>
  )
}

export default AnnouncementDetails
