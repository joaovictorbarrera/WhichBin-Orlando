import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import {
  getAnnouncementById,
  type Announcement,
} from '../services/announcementService'
import PageLayout from '../components/PageLayout'

function AnnouncementDetails() {
  const { announcementId } = useParams()

  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!announcementId) {
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

  if (loading && announcementId) {
    return (
      <PageLayout className="announcement-details-page" width="wide">
        <Link to="/announcements">
          <FiArrowLeft aria-hidden="true" />
          Back to Announcements
        </Link>

        <h1>Loading announcement...</h1>
      </PageLayout>
    )
  }

  if (!announcement || !announcementId) {
    return (
      <PageLayout className="announcement-details-page" width="wide">
        <Link to="/announcements">
          <FiArrowLeft aria-hidden="true" />
          Back to Announcements
        </Link>

        <h1>Announcement Not Found</h1>
        <p>The requested announcement could not be found.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="announcement-details-page" width="wide">
      <Link to="/announcements">
        <FiArrowLeft aria-hidden="true" />
        Back to Announcements
      </Link>

      <h1>{announcement.title}</h1>

      <p>{announcement.message}</p>

      <p>
        <strong>Type:</strong>{' '}
        {announcement.type.replaceAll('_', ' ')}
      </p>

      <p>
        <strong>Start Date:</strong> {announcement.startDate}
      </p>

      {announcement.endDate && (
        <p>
          <strong>End Date:</strong> {announcement.endDate}
        </p>
      )}
    </PageLayout>
  )
}

export default AnnouncementDetails