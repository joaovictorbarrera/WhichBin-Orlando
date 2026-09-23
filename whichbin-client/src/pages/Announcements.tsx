import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAnnouncements,
  type Announcement,
} from '../services/announcementService'
import PageLayout from '../components/PageLayout'

function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getAnnouncements()
      .then((data) => {
        if (isMounted) {
          setAnnouncements(data ?? [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setAnnouncements([])
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <PageLayout className="announcements-page" width="wide">
        <h1>Announcements</h1>
        <p>Loading announcements...</p>
      </PageLayout>
    )
  }

  if (!announcements.length) {
    return (
      <PageLayout className="announcements-page" width="wide">
        <h1>Announcements</h1>
        <p>No announcements are available right now.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="announcements-page" width="wide">
      <h1>Announcements</h1>

      <p>
        Stay up to date with recycling service changes and important notices.
      </p>

      <div className="announcements-list">
        {announcements
          .filter((announcement) => announcement.active)
          .map((announcement) => (
            <Link
              to={'/announcements/' + announcement.id}
              className="announcement-card"
              key={announcement.id}
            >
              <h2>{announcement.title}</h2>

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
            </Link>
          ))}
      </div>
    </PageLayout>
  )
}

export default Announcements