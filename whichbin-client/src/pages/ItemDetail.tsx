import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiAlertCircle,
  FiInfo,
  FiBox,
  FiClock,
  FiTrash2,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import PageLayout from '../components/PageLayout'
import { fetchItemById, type Item } from '../services/itemService'
import { isAbortError } from '../helpers/ErrorHelper'
import './ItemDetail.css'

function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(Boolean(itemId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) {
      return
    }

    const controller = new AbortController()
    let isMounted = true

    fetchItemById(itemId, controller.signal)
      .then((data) => {
        if (!isMounted) return
        if (data) {
          setItem(data)
          setError(null)
        } else {
          setItem(null)
          setError('The requested item could not be found.')
        }
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted || isAbortError(err)) return
        setItem(null)
        setError('Failed to load item details. Please check your connection and try again.')
        setLoading(false)
      })

    return () => {
      isMounted = false
      controller.abort()
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

  return (
    <PageLayout className="item-detail-page" width="wide">
      <Link className="item-detail-back-link" to="/item-search">
        <FiArrowLeft aria-hidden="true" />
        Back to Item Search
      </Link>

      <article
        className={`item-detail-card ${
          item.recyclable ? 'item-detail-recyclable' : 'item-detail-trash'
        }`}
      >
        <div className="item-detail-header">
          <div className="item-detail-icon">
            {item.recyclable ? (
              <FaRecycle aria-hidden="true" />
            ) : (
              <FiTrash2 aria-hidden="true" />
            )}
          </div>

          <div className="item-detail-heading-content">
            <span className="item-detail-badge">
              {item.recyclable ? (
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
          {item.recyclable ? (
            <>
              <FiTrash2 className="item-detail-bin-icon item-detail-bin-icon-blue" aria-hidden="true" />
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
              <FiTrash2 className="item-detail-bin-icon item-detail-bin-icon-gray" aria-hidden="true" />
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

        {item.recyclable && item.largeItem && (
          <section className="item-detail-large-item-banner" aria-labelledby="large-item-heading">
            <FiBox aria-hidden="true" />
            <div>
              <h2 id="large-item-heading">Large Item Pick Up</h2>
              <p>
                The City of Orlando picks up some large items for free on your yard waste
                collection day, without scheduling.{' '}
                <a
                  href="https://www.orlando.gov/Trash-Recycling/Get-Large-Items-Picked-Up"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn more about this collection process.
                </a>
              </p>
              <p className="item-detail-large-item-time">
                <FiClock aria-hidden="true" />
                Place items at the curb before 6 a.m. on your scheduled yard waste collection day.
              </p>
            </div>
          </section>
        )}

        <section className="item-detail-section" aria-labelledby="instructions-heading">
          <h2 id="instructions-heading" className="item-detail-section-title">
            <FiInfo aria-hidden="true" />
            Disposal Instructions
          </h2>
          <p className="item-detail-instructions">{item.information}</p>
        </section>

      </article>
    </PageLayout>
  )
}

export default ItemDetail
