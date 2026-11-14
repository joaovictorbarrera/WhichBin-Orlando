import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiInfo,
  FiBox,
  FiClock,
  FiTrash2,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import PageLayout from '../../components/PageLayout'
import DetailStatus, {
  type DetailStatusType,
} from '../../components/DetailStatus'
import { fetchItemById, type Item } from '../../services/itemService'
import { isAbortError, isNotFoundError } from '../../helpers/ErrorHelper'
import './ItemDetail.css'

type ItemDetailState = DetailStatusType | 'success'

type ItemDetailViewState = {
  itemId: string | undefined
  status: ItemDetailState
  item: Item | null
}

function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>()
  const [detailState, setDetailState] = useState<ItemDetailViewState>({
    itemId,
    status: itemId ? 'loading' : 'failed',
    item: null,
  })
  const [retryCount, setRetryCount] = useState(0)
  const status =
    detailState.itemId === itemId
      ? detailState.status
      : itemId
        ? 'loading'
        : 'failed'
  const item = detailState.itemId === itemId ? detailState.item : null

  useEffect(() => {
    if (!itemId) {
      return
    }

    const controller = new AbortController()
    let isMounted = true

    fetchItemById(itemId, controller.signal)
      .then((data) => {
        if (!isMounted) return
        setDetailState({ itemId, status: 'success', item: data })
      })
      .catch((err) => {
        if (!isMounted || isAbortError(err)) return
        setDetailState({
          itemId,
          status: isNotFoundError(err) ? 'not-found' : 'failed',
          item: null,
        })
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [itemId, retryCount])

  if (status !== 'success' || !item) {
    return (
      <PageLayout className="item-detail-page" width="wide">
        <Link className="item-detail-back-link" to="/item-search">
          <FiArrowLeft aria-hidden="true" />
          Back to Item Search
        </Link>

        <DetailStatus
          featureName="item"
          status={status === 'success' ? 'failed' : status}
          onRetry={() => {
            setDetailState({ itemId, status: 'loading', item: null })
            setRetryCount((count) => count + 1)
          }}
        />
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
          <FiInfo aria-hidden="true" />
          <div>
            <strong>{item.disposalMethod
              ? item.disposalMethod.toLowerCase().replaceAll('_', ' ')
              : item.recyclable ? 'Recycling' : 'Disposal guidance'}</strong>
            <p>Follow the preparation requirements and collection options below.</p>
          </div>
        </div>

        {item.largeItem && (
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
          <a href="https://www.orlando.gov/Trash-Recycling/What-Goes-Where" target="_blank" rel="noreferrer">
            Further instructions from the City of Orlando
          </a>
        </section>

        <aside className="item-detail-reuse-banner" aria-labelledby="reuse-heading">
          <FaRecycle aria-hidden="true" />
          <div>
            <h2 id="reuse-heading">Consider Reuse</h2>
            <p>
              Many items don&apos;t need to be thrown away - they can be reused! Donate items to
              reuse centers, and always call ahead to ensure the item can be donated. You
              can also upcycle the item into something new.
            </p>
          </div>
        </aside>

      </article>
    </PageLayout>
  )
}

export default ItemDetail
