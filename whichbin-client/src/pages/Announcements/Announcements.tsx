import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiChevronRight } from 'react-icons/fi'
import {
  announcementTypes,
  getAnnouncements,
  type AnnouncementType,
  type Announcement,
} from '../../services/announcementService'
import PageLayout from '../../components/PageLayout'
import './Announcements.css'

function formatType(type: string) {
  return type.replaceAll('_', ' ')
}

function formatDateTime(dateTime: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime))
}

function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<AnnouncementType | ''>('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getAnnouncements(filterType || undefined)
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
  }, [filterType])

  return (
    <PageLayout className="announcements-page" width="wide">
      <div className="announcements-header">
        <div className="announcements-heading-icon">
          <FiBell aria-hidden="true" />
        </div>

        <div>
          <h1>Announcements</h1>
          <p className="announcements-intro">
            Stay up to date with recycling service changes, schedule updates,
            and important notices from the City of Orlando.
          </p>
        </div>
      </div>

      <div className="announcements-filter">
        <label htmlFor="announcements-type-filter">Filter by type</label>
        <select
          id="announcements-type-filter"
          value={filterType}
          onChange={(event) =>
            setFilterType(event.target.value as AnnouncementType | '')
          }
        >
          <option value="">All types</option>
          {announcementTypes.map((announcementType) => (
            <option key={announcementType.value} value={announcementType.value}>
              {announcementType.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="announcements-loading">
          Loading announcements...
        </p>
      )}

      {!loading && announcements.length === 0 && (
        <div className="announcements-status">
          <FiBell aria-hidden="true" />
          <h2>
            {filterType ? 'No announcements of this type' : 'No announcements right now'}
          </h2>
          <p>
            {filterType
              ? 'Try selecting another type to see more announcements.'
              : 'Check back later for recycling updates and service notices.'}
          </p>
        </div>
      )}

      {!loading && announcements.length > 0 && (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <Link
              to={`/announcements/${announcement.id}`}
              className={`announcement-card announcement-${announcement.type
                .toLowerCase()
                .replaceAll('_', '-')}`}
              key={announcement.id}
            >
              <div className="announcement-card-content">
                <div className="announcement-card-top">
                  <span className="announcement-type">
                    {formatType(announcement.type)}
                  </span>

                  <span className="announcement-date">
                    {formatDateTime(announcement.startDate)}
                  </span>
                </div>

                <h2>{announcement.title}</h2>

                <p className="announcement-preview">
                  {announcement.message}
                </p>

                {announcement.endDate && (
                  <small>
                    Available through {formatDateTime(announcement.endDate)}
                  </small>
                )}
              </div>

              <FiChevronRight
                className="announcement-arrow"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  )
}

export default Announcements