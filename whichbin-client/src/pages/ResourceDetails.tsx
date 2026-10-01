import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiList,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
import {
  getResourceById,
  type Resource,
} from '../services/resourceService'
import PageLayout from '../components/PageLayout'
import './ResourceDetails.css'

function ResourceDetails() {
  const { resourceId } = useParams()

  const [resource, setResource] = useState<Resource | null>(null)

  useEffect(() => {
    if (!resourceId) {
      return
    }

    let isMounted = true

    getResourceById(resourceId)
      .then((data) => {
        if (isMounted) {
          setResource(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setResource(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [resourceId])

  function getSectionIcon(styleType: string) {
    if (styleType.includes('blue')) {
      return <FiInfo aria-hidden="true" />
    }

    if (styleType.includes('orange')) {
      return <FiAlertTriangle aria-hidden="true" />
    }

    if (styleType.includes('red')) {
      return <FiXCircle aria-hidden="true" />
    }

    return <FiCheckCircle aria-hidden="true" />
  }

  function getSectionClass(styleType: string) {
    if (styleType.includes('blue')) {
      return 'resource-section resource-section-blue'
    }

    if (styleType.includes('orange')) {
      return 'resource-section resource-section-orange'
    }

    if (styleType.includes('red')) {
      return 'resource-section resource-section-red'
    }

    return 'resource-section resource-section-green'
  }

  if (!resource || !resourceId) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <div className="resource-empty-icon">
            <FiInfo aria-hidden="true" />
          </div>

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
        <div className="resource-hero resource-hero-green">
          <div className="resource-hero-icon">
            <FaRecycle aria-hidden="true" />
          </div>

          <div>
            <p className="resource-hero-label">
              Educational Resource
            </p>

            <h1>{resource.title}</h1>

            <p>{resource.description}</p>
          </div>
        </div>

        <div className="resource-section-list">
          {(resource.sections ?? []).map((section, sectionIndex) => (
            <section
              className={getSectionClass(section.styleType)}
              key={`${section.heading}-${sectionIndex}`}
            >
              <div className="resource-section-heading">
                <div className="resource-section-icon">
                  {getSectionIcon(section.styleType)}
                </div>

                <div>
                  <h2>{section.heading}</h2>
                </div>
              </div>

              <ul>
                {section.items.split('|').map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {(resource.sections ?? []).length === 0 && (
          <div className="resource-empty-message">
            <FiList aria-hidden="true" />
            <p>
              No information has been added to this resource yet.
            </p>
          </div>
        )}

        {resource.pdfUrl && resource.pdfUrl.trim() !== '' && (
          <section className="resource-pdf">
            <div className="resource-pdf-header">
              <div>
                <span className="resource-pdf-label">
                  PDF GUIDE
                </span>

                <h2>Additional Information</h2>

                <p>
                  View the complete guide for this resource.
                </p>
              </div>

              <a
                href={resource.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-pdf-button"
              >
                Open PDF
              </a>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  )
}

export default ResourceDetails