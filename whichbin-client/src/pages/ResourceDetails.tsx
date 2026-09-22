import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './ResourceDetails.css'

type ResourceSection = {
  heading: string
  styleType: string
  items: string
}

type Resource = {
  id: number
  title: string
  description: string
  content: string
  styleType: string
  sections: ResourceSection[]
}

function ResourceDetails() {
  const { resourceId } = useParams()

  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!resourceId) {
      setError('Resource not found.')
      setLoading(false)
      return
    }

    fetch(`http://localhost:5000/api/resources/${resourceId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Resource not found')
        }

        return response.json()
      })
      .then((data) => {
        setResource(data)
        setLoading(false)
      })
      .catch(() => {
        setError('We could not find the resource you selected.')
        setLoading(false)
      })
  }, [resourceId])

  if (loading) {
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

  if (error || !resource) {
    return (
      <main className="resource-details-page">
        <Link to="/resources" className="resource-back-link">
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1>Resource Not Found</h1>
          <p>{error}</p>
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

        {resource.sections.map((section, index) => (
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