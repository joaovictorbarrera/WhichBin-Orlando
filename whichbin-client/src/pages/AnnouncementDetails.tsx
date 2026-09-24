import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiBell,
  FiCalendar,
} from 'react-icons/fi'
import {
  getAnnouncementById,
  type Announcement,
} from '../services/announcementService'
import PageLayout from '../components/PageLayout'
import './AnnouncementDetails.css'

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

  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!announcementId) {
      setLoading(false)
      return
    }

    let isMounted = true

    getAnnouncementById(announcementId)
      .then((data) => {
        if (isMounted) {
          setAnnouncement(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setAnnouncement(null)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [announcementId])

  if (loading) {
    return (
      <PageLayout className="announcement-details-page" width="wide">
        <Link className="announcement-back-link" to="/announcements">
          <FiArrowLeft aria-hidden="true" />
          Back to Announcements
        </Link>

        <div className="announcement-details-status">
          <p>Loading announcement...</p>
        </div>
      </PageLayout>
    )
  }

  if (!announcement) {
    return (
      <PageLayout className="announcement-details-page" width="wide">
        <Link className="announcement-back-link" to="/announcements">
          <FiArrowLeft aria-hidden="true" />
          Back to Announcements
        </Link>

        <div className="announcement-details-status">
          <FiBell aria-hidden="true" />
          <h1>Announcement Not Found</h1>
          <p>The requested announcement could not be found.</p>
        </div>
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