import { useEffect, useState, type FormEvent } from 'react'
import {
  FiArrowLeft,
  FiBell,
  FiEdit,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  type Announcement,
  type AnnouncementInput,
} from '../../services/announcementService'
import './AdminSection.css'
import './AdminAnnouncements.css'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'

const announcementTypes = [
  { value: 'GENERAL', label: 'General' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'SCHEDULE_CHANGE', label: 'Schedule Change' },
  { value: 'SERVICE_ALERT', label: 'Service Alert' },
  { value: 'RECYCLING_CHANGE', label: 'Recycling Change' },
]

type AnnouncementStatus =
  | 'Active'
  | 'Scheduled'
  | 'Expired'
  | 'Inactive'

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('GENERAL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [active, setActive] = useState(true)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    setLoading(true)
    setError(false)

    const result = await getAllAnnouncements()

    if (result === null) {
      setError(true)
      setAnnouncements([])
    } else {
      setAnnouncements(sortAnnouncements(result))
    }

    setLoading(false)
  }

  function resetForm() {
    setTitle('')
    setMessage('')
    setType('GENERAL')
    setStartDate('')
    setEndDate('')
    setActive(true)
    setEditingAnnouncement(null)
    setFormError('')
  }

  function handleAddAnnouncement() {
    resetForm()
    setShowForm(true)
  }

  function handleEditAnnouncement(announcement: Announcement) {
    setEditingAnnouncement(announcement)
    setTitle(announcement.title)
    setMessage(announcement.message)
    setType(announcement.type)
    setStartDate(toDateTimeLocalValue(announcement.startDate))
    setEndDate(
      announcement.endDate
        ? toDateTimeLocalValue(announcement.endDate)
        : ''
    )
    setActive(announcement.active)
    setFormError('')
    setShowForm(true)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelForm() {
    if (saving) {
      return
    }

    resetForm()
    setShowForm(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim() || !message.trim() || !startDate) {
      setFormError('Title, message, and start date/time are required.')
      return
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setFormError(
        'End date and time cannot be before the start date and time.'
      )
      return
    }

    const announcementInput: AnnouncementInput = {
      title: title.trim(),
      message: message.trim(),
      type,
      startDate,
      endDate: endDate || null,
      active,
    }

    setSaving(true)
    setFormError('')

    const result = editingAnnouncement
      ? await updateAnnouncement(editingAnnouncement.id, announcementInput)
      : await createAnnouncement(announcementInput)

    if (result === null) {
      setFormError(
        editingAnnouncement
          ? 'The announcement could not be updated.'
          : 'The announcement could not be created.'
      )
      setSaving(false)
      return
    }

    if (editingAnnouncement) {
      setAnnouncements((current) =>
        sortAnnouncements(
          current.map((announcement) =>
            announcement.id === result.id ? result : announcement
          )
        )
      )
    } else {
      setAnnouncements((current) =>
        sortAnnouncements([...current, result])
      )
    }

    setSaving(false)
    resetForm()
    setShowForm(false)
  }

function handleDeleteAnnouncement(announcement: Announcement) {
  setDeleteTarget(announcement)
}

function handleCloseDeleteModal() {
  if (deletingId !== null) {
    return
  }

  setDeleteTarget(null)
}

async function handleConfirmDelete() {
  if (!deleteTarget) {
    return
  }

  const announcementId = deleteTarget.id

  setDeletingId(announcementId)

  const success = await deleteAnnouncement(announcementId)

  if (!success) {
    window.alert('The announcement could not be deleted.')
    setDeletingId(null)
    return
  }

  setAnnouncements((current) =>
    current.filter((item) => item.id !== announcementId)
  )

  setDeletingId(null)
  setDeleteTarget(null)
}

  return (
    <PageLayout
      className="admin-section-page admin-section-announcements"
      width="wide"
    >
      <Link to="/admin" className="admin-section-back">
        <FiArrowLeft />
        Back to dashboard
      </Link>

      <section className="admin-announcements-header">
        <div className="admin-announcements-heading">
          <span className="admin-section-icon">
            <FiBell />
          </span>

          <div>
            <p className="admin-section-eyebrow">Admin workspace</p>
            <h1>Manage Announcements</h1>
            <p>
              Publish and update resident-facing recycling announcements.
            </p>
          </div>
        </div>

        {!showForm && (
          <button
            type="button"
            className="admin-announcements-add"
            onClick={handleAddAnnouncement}
          >
            <FiPlus />
            Add Announcement
          </button>
        )}
      </section>

      {showForm && (
        <section className="admin-announcement-form-panel">
          <div className="admin-announcement-form-header">
            <div>
              <p className="admin-section-eyebrow">
                {editingAnnouncement ? 'Edit announcement' : 'New announcement'}
              </p>
              <h2>
                {editingAnnouncement
                  ? editingAnnouncement.title
                  : 'Create Announcement'}
              </h2>
            </div>

            <button
              type="button"
              className="admin-announcement-close"
              onClick={handleCancelForm}
              disabled={saving}
              aria-label="Close form"
            >
              <FiX />
            </button>
          </div>

          <form
            className="admin-announcement-form"
            onSubmit={handleSubmit}
          >
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={saving}
                required
              />
            </label>

            <label>
              Message
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                disabled={saving}
                required
              />
            </label>

            <div className="admin-announcement-form-grid">
              <label>
                Type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  disabled={saving}
                >
                  {announcementTypes.map((announcementType) => (
                    <option
                      key={announcementType.value}
                      value={announcementType.value}
                    >
                      {announcementType.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Start Date &amp; Time
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  disabled={saving}
                  required
                />
              </label>

              <label>
                End Date &amp; Time
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  disabled={saving}
                />
              </label>
            </div>

            <label className="admin-announcement-active">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                disabled={saving}
              />
              <span>
                <strong>Active</strong>
                <small>
                  Allow this announcement to appear when its scheduled time
                  is current.
                </small>
              </span>
            </label>

            {formError && (
              <p className="admin-announcement-form-error">
                {formError}
              </p>
            )}

            <div className="admin-announcement-form-actions">
              <button
                type="button"
                className="admin-announcement-cancel"
                onClick={handleCancelForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-announcements-add"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingAnnouncement
                    ? 'Save Changes'
                    : 'Create Announcement'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-announcements-list-section">
        <div className="admin-announcements-list-heading">
          <div>
            <h2>Announcements</h2>
            <p>
              Manage current, scheduled, inactive, and expired announcements.
            </p>
          </div>

          {!loading && !error && (
            <span>
              {announcements.length}{' '}
              {announcements.length === 1
                ? 'announcement'
                : 'announcements'}
            </span>
          )}
        </div>

        {loading && (
          <p className="admin-announcements-loading">
            Loading announcements...
          </p>
        )}

        {!loading && error && (
          <div className="admin-announcements-empty">
            <p>Announcements could not be loaded.</p>
            <button type="button" onClick={loadAnnouncements}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && announcements.length === 0 && (
          <div className="admin-announcements-empty">
            <p>No announcements have been created yet.</p>
          </div>
        )}

        {!loading && !error && announcements.length > 0 && (
          <div className="admin-announcements-list">
            {announcements.map((announcement) => {
              const status = getAnnouncementStatus(announcement)

              return (
                <article
                  className="admin-announcement-card"
                  key={announcement.id}
                >
                  <div className="admin-announcement-content">
                    <div className="admin-announcement-meta">
                      <span
                        className={`admin-announcement-status admin-announcement-status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>

                      <span>
                        {formatAnnouncementType(announcement.type)}
                      </span>
                    </div>

                    <h3>{announcement.title}</h3>

                    <p className="admin-announcement-message">
                      {announcement.message}
                    </p>

                    <div className="admin-announcement-dates">
                      <span>
                        <strong>Starts:</strong>{' '}
                        {formatDateTime(announcement.startDate)}
                      </span>

                      <span>
                        <strong>Ends:</strong>{' '}
                        {announcement.endDate
                          ? formatDateTime(announcement.endDate)
                          : 'No end date'}
                      </span>
                    </div>
                  </div>

                  <div className="admin-announcement-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditAnnouncement(announcement)
                      }
                      disabled={
                        showForm ||
                        deletingId === announcement.id
                      }
                    >
                      <FiEdit />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-announcement-delete"
                      onClick={() =>
                        handleDeleteAnnouncement(announcement)
                      }
                      disabled={
                        showForm ||
                        deletingId === announcement.id
                      }
                    >
                      <FiTrash2 />
                      {deletingId === announcement.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {deleteTarget && (
        <DeleteConfirmModal
        title="Delete Announcement?"
        itemName={deleteTarget.title}
        description="This announcement will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Announcement"
        loading={deletingId === deleteTarget.id}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
     )}
    </PageLayout>
  )
}

function getAnnouncementStatus(
  announcement: Announcement
): AnnouncementStatus {
  if (!announcement.active) {
    return 'Inactive'
  }

  const now = new Date()
  const start = new Date(announcement.startDate)
  const end = announcement.endDate
    ? new Date(announcement.endDate)
    : null

  if (start > now) {
    return 'Scheduled'
  }

  if (end && end < now) {
    return 'Expired'
  }

  return 'Active'
}

function sortAnnouncements(
  announcements: Announcement[]
): Announcement[] {
  return [...announcements].sort(
    (first, second) =>
      new Date(second.startDate).getTime() -
      new Date(first.startDate).getTime()
  )
}

function formatAnnouncementType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function toDateTimeLocalValue(value: string) {
  return value.length >= 16 ? value.slice(0, 16) : value
}

export default AdminAnnouncements
