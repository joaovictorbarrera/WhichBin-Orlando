import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import {
  getResourceById,
  type Resource,
} from '../services/resourceService'
import PageLayout from '../components/PageLayout'
import './ResourceDetails.css'

function ResourceDetails() {
  const { resourceId } = useParams()

  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resourceId) {
      return
    }

    let isMounted = true

    getResourceById(resourceId)
      .then((data) => {
        if (isMounted) {
          setResource(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setResource(null)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [resourceId])

  if (loading && resourceId) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1 aria-live="polite">Loading resource...</h1>
        </div>
      </PageLayout>
    )
  }

  if (!resource || !resourceId) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1>Resource Not Found</h1>
          <p>Resource not found.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="resource-details-page" width="wide">
      <Link to="/resources" className="resource-back-link">
        <FiArrowLeft aria-hidden="true" />
        Back to Educational Resources
      </Link>

      <div className="resource-details-card">
        <h1>{resource.title}</h1>

        <p>{resource.description}</p>

        {(resource.sections ?? []).map((section) => (
          <section
            className={`resource-section ${section.styleType}`}
            key={`${section.heading}-${section.styleType}`}
          >
            <h2>{section.heading}</h2>

            <ul>
              {section.items.split('|').map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}

export default ResourceDetails
