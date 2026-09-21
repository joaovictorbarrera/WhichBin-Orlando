import { useParams, Link } from 'react-router-dom'
import './ResourceDetails.css'

type Resource = {
  title: string
  description: string
  sections?: {
    heading: string
    items: string[]
  }[]
}

const resources: Record<string, Resource> = {
  'recycling-basics': {
    title: 'Recycling Basics',
    description: 'Learn what can and cannot be recycled in the City of Orlando.',
    sections: [
      {
        heading: 'What Can Be Recycled?',
        items: [
          'Plastic bottles and containers',
          'Glass bottles and jars',
          'Aluminum, steel, and tin cans',
          'Flattened cardboard boxes',
          'Newspapers, paper bags, junk mail, sheets of paper, and drink cartons'
        ]
      },
      {
        heading: 'Before You Recycle',
        items: [
          'Empty and clean plastic containers',
          'Keep plastic caps on',
          'Empty and clean glass bottles and jars',
          'Remove lids from glass containers',
          'Empty and clean metal cans',
          'Flatten cardboard boxes'
        ]
      },
      {
        heading: 'What Does Not Belong?',
        items: [
          'Food waste',
          'Plastic bags',
          'Plastic wrap',
          'Polystyrene foam cups and containers',
          'Aluminum food pans',
          'Household garbage'
        ]
      },
      {
        heading: 'Remember',
        items: [
          'Do not put recyclables inside plastic bags.',
          'Place recyclables directly into the recycling cart.'
        ]
      }
    ]
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

        {resource.sections?.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>

            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

export default ResourceDetails