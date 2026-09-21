import { useParams, Link } from 'react-router-dom'
import './ResourceDetails.css'

type Resource = {
  title: string
  description: string
}

const resources: Record<string, Resource> = {
  'recycling-basics': {
    title: 'Recycling Basics',
    description: 'Learn what can and cannot be recycled.'
  },
  'prepare-items': {
    title: 'How to Prepare Items',
    description: 'Learn how to prepare your recyclable items before placing them in the bin.'
  },
  'common-mistakes': {
    title: 'Common Mistakes',
    description: 'Learn about common recycling mistakes and how to avoid them.'
  },
  'orlando-guide': {
    title: 'Orlando Recycling Guide',
    description: 'Learn more about recycling guidelines for residents of Orlando.'
  }
}

function ResourceDetails() {
  const { resourceId } = useParams()

  const resource = resourceId ? resources[resourceId] : undefined

  if (!resource) {
    return (
      <main className="resource-details-page">
        <Link to="/resources" className="resource-back-link">
          ← Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1>Resource Not Found</h1>

          <p>We could not find the resource you selected.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="resource-details-page">
      <Link to="/resources" className="resource-back-link">
        ← Back to Educational Resources
      </Link>

      <div className="resource-details-card">
        <h1>{resource.title}</h1>

        <p>{resource.description}</p>
      </div>
    </main>
  )
}

export default ResourceDetails