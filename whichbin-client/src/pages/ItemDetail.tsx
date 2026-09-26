import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiInfo,
  FiTrash2,
  FiCheckCircle,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import PageLayout from '../components/PageLayout'
import { fetchItemById, type Item } from '../services/itemService'
import './ItemDetail.css'

function formatDateTime(dateTime?: string): string | null {
  if (!dateTime) return null
  try {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return null
  }
}

function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) {
      return
    }

    let isMounted = true

    fetchItemById(itemId)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setItem(data)
            setError(null)
          } else {
            setItem(null)
            setError('The requested item could not be found.')
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setItem(null)
          setError('Failed to load item details. Please check your connection and try again.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [itemId])

  if (loading) {
    return (
      <PageLayout className="item-detail-page" width="wide">
        <Link className="item-detail-back-link" to="/item-search">
          <FiArrowLeft aria-hidden="true" />
          Back to Item Search
        </Link>

        <div className="item-detail-status" role="status">
          <div className="loading-spinner" aria-hidden="true" />
          <p>Loading item details...</p>
        </div>
      </PageLayout>
    )
  }

  if (error || !item) {
    return (
      <PageLayout className="item-detail-page" width="wide">
        <Link className="item-detail-back-link" to="/item-search">
          <FiArrowLeft aria-hidden="true" />
          Back to Item Search
        </Link>

        <div className="item-detail-status item-detail-error" role="alert">
          <FiAlertCircle className="status-icon" aria-hidden="true" />
          <h1>Item Not Found</h1>
          <p>{error || 'The requested item could not be found.'}</p>
          <Link to="/item-search" className="item-detail-action-btn">
            Return to search
          </Link>
        </div>
      </PageLayout>
    )
  }

  const formattedDate = formatDateTime(item.createdAt)

  return (
    <PageLayout className="item-detail-page" width="wide">
      <Link className="item-detail-back-link" to="/item-search">
        <FiArrowLeft aria-hidden="true" />
        Back to Item Search
      </Link>

      <article
        className={`item-detail-card ${
          item.recycleable ? 'item-detail-recyclable' : 'item-detail-trash'
        }`}
      >
        <div className="item-detail-header">
          <div className="item-detail-icon">
            {item.recycleable ? (
              <FaRecycle aria-hidden="true" />
            ) : (
              <FiTrash2 aria-hidden="true" />
            )}
          </div>

          <div className="item-detail-heading-content">
            <span className="item-detail-badge">
              {item.recycleable ? (
                <>
                  <FaRecycle aria-hidden="true" />
                  Recyclable
                </>
              ) : (
                <>
                  <FiTrash2 aria-hidden="true" />
                  Non-Recyclable
                </>
              )}
            </span>

            <h1>{item.name}</h1>
          </div>
        </div>

        <div className="item-detail-classification-banner">
          {item.recycleable ? (
            <>
              <FiCheckCircle aria-hidden="true" />
              <div>
                <strong>Orlando Recycling Cart (Blue Bin)</strong>
                <p>
                  This item is accepted in Orlando&apos;s residential recycling program.
                  Ensure it is empty, clean, and dry before placing it loose in your cart.
                </p>
              </div>
            </>
          ) : (
            <>
              <FiTrash2 aria-hidden="true" />
              <div>
                <strong>Regular Trash Cart (Garbage)</strong>
                <p>
                  This item cannot be placed in the recycling bin. Please dispose of it in
                  your standard garbage cart.
                </p>
              </div>
            </>
          )}
        </div>

        <section className="item-detail-section" aria-labelledby="instructions-heading">
          <h2 id="instructions-heading" className="item-detail-section-title">
            <FiInfo aria-hidden="true" />
            Disposal Instructions
          </h2>
          <p className="item-detail-instructions">{item.information}</p>
        </section>

        <section className="item-detail-meta" aria-label="Item metadata">
          <div className="item-detail-meta-item">
            <FiCalendar aria-hidden="true" />
            <div>
              <span>Record ID</span>
              <strong>#{item.id}</strong>
            </div>
          </div>

          {formattedDate && (
            <div className="item-detail-meta-item">
              <FiClock aria-hidden="true" />
              <div>
                <span>Added on</span>
                <strong>{formattedDate}</strong>
              </div>
            </div>
          )}
        </section>
      </article>
    </PageLayout>
  )
}

export default ItemDetail
