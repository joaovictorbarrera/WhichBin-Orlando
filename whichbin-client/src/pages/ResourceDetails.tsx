import { useParams, Link } from 'react-router-dom'

function ResourceDetails() {
  const { resourceId } = useParams()

  const resources = {
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

  const resource = resources[resourceId as keyof typeof resources]

  if (!resource) {
    return (
      <main>
        <Link to="/resources">← Back to Educational Resources</Link>

        <h1>Resource Not Found</h1>

        <p>We could not find the resource you selected.</p>
      </main>
    )
  }

  return (
    <main>
      <Link to="/resources">← Back to Educational Resources</Link>

      <h1>{resource.title}</h1>

      <p>{resource.description}</p>
    </main>
  )
}

export default ResourceDetails