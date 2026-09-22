import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getResourceById,
  type Resource,
} from '../services/resourceService'
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
      <main className="resource-details-page">
        <Link to="/resources" className="resource-back-link">
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1>Loading...</h1>
        </div>
      </main>
    )
  }

  if (!resource || !resourceId) {
    return (
      <main className="resource-details-page">
        <Link to="/resources" className="resource-back-link">
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1>Resource Not Found</h1>
          <p>Resource not found.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="resource-details-page">
      <Link to="/resources" className="resource-back-link">
        Back to Educational Resources
      </Link>

      <div className="resource-details-card">
        <h1>{resource.title}</h1>

        <p>{resource.description}</p>

        {(resource.sections ?? []).map((section, index) => (
          <section
            className={`resource-section ${section.styleType}`}
            key={index}
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
    </main>
  )
}

export default ResourceDetails
