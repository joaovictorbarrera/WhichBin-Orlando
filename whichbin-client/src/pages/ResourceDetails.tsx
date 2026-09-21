import { useParams, Link } from 'react-router-dom'
import './ResourceDetails.css'

type Resource = {
  title: string
  description: string
  sections?: {
    heading: string
    items: string[]
    type: 'green' | 'blue' | 'orange' | 'red'
  }[]
}

const resources: Record<string, Resource> = {
  'recycling-basics': {
    title: 'Recycling Basics',
    description: 'Learn what can and cannot be recycled in the City of Orlando.',
    sections: [
      {
        heading: 'What Can Be Recycled?',
        type: 'green',
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
        type: 'blue',
        items: [
          'Empty and clean plastic containers',
          'Rinse the container and let it dry.',
          'Plastic caps can stay on',
          'Empty and clean glass bottles and jars',
          'Remove metal lids',
          'Empty and clean metal cans',
          'Flatten cardboard boxes'
        ]
      },
      {
        heading: 'What Does Not Belong?',
        type: 'red',
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
        type: 'green',
        items: [
          'Do not put recyclables inside plastic bags.',
          'Place recyclables directly into the recycling cart.'
        ]
      }
    ]
  },

  'prepare-items': {
    title: 'How to Prepare Items',
    description: 'Simple steps to prepare your recyclable items before placing them in the recycling cart.',
    sections: [
      {
        heading: 'Plastic Containers',
        type: 'blue',
        items: [
          'Empty the container.',
          'Rinse the container and let it dry.',
          'Plastic caps can stay on.'
        ]
      },
      {
        heading: 'Glass Containers',
        type: 'blue',
        items: [
          'Empty and clean the container.',
          'Remove metal lids.',
          'Place glass bottles and jars loose in the recycling cart.'
        ]
      },
      {
        heading: 'Cans',
        type: 'blue',
        items: [
          'Empty the can.',
          'Rinse the can and let it dry.',
          'Recycle aluminum, steel, and tin cans.'
        ]
      },
      {
        heading: 'Cardboard',
        type: 'blue',
        items: [
          'Flatten cardboard boxes.',
          'Keep cardboard clean and dry.',
          'Do not recycle greasy or food-soiled cardboard.'
        ]
      },
      {
        heading: 'One Important Rule',
        type: 'green',
        items: [
          'Keep recyclables loose.',
          'Do not put recyclables inside plastic bags.'
        ]
      }
    ]
  },

  'common-mistakes': {
    title: 'Common Mistakes',
    description: 'Avoid common recycling mistakes that can contaminate the recycling cart or cause problems for recycling equipment.',
    sections: [
      {
        heading: 'Putting Recyclables in Bags',
        type: 'orange',
        items: [
          'Do not put recyclables inside plastic bags.',
          'Place recyclable items directly into the recycling cart.',
          'Plastic bags can get tangled in recycling equipment.'
        ]
      },
      {
        heading: 'Recycling Food Waste',
        type: 'red',
        items: [
          'Food waste does not belong in the recycling cart.',
          'Empty food and drink containers before recycling them.',
          'Keep food and other household garbage out of the recycling cart.'
        ]
      },
      {
        heading: 'Recycling Plastic Bags and Wrap',
        type: 'red',
        items: [
          'Plastic bags do not belong in the recycling cart.',
          'Plastic wrap and film plastic should not be placed in the recycling cart.'
        ]
      },
      {
        heading: 'Recycling Styrofoam',
        type: 'red',
        items: [
          'Styrofoam cups and containers do not belong in the recycling cart.',
          'Keep foam packing materials out of the recycling cart.'
        ]
      },
      {
        heading: 'Recycling Contaminated Items',
        type: 'orange',
        items: [
          'Empty and clean recyclable containers before placing them in the cart.',
          'Do not put household garbage in the recycling cart.',
          'When in doubt, check the item before putting it in the recycling cart.'
        ]
      }
    ]
  },

  'orlando-guide': {
    title: 'Orlando Recycling Guide',
    description: 'A quick guide to recycling in the City of Orlando.',
    sections: [
      {
        heading: 'What Goes in the Recycling Cart?',
        type: 'green',
        items: [
          'Plastic bottles and containers',
          'Glass bottles and jars',
          'Aluminum, steel, and tin cans',
          'Flattened cardboard',
          'Paper and drink cartons'
        ]
      },
      {
        heading: 'Keep It Clean',
        type: 'blue',
        items: [
          'Empty containers before recycling them.',
          'Rinse containers when needed and let them dry.',
          'Keep food and other garbage out of the recycling cart.'
        ]
      },
      {
        heading: 'Keep It Loose',
        type: 'blue',
        items: [
          'Place recyclable items directly into the recycling cart.',
          'Do not put recyclables inside plastic bags.',
          'Plastic bags and plastic film do not belong in the recycling cart.'
        ]
      },
      {
        heading: 'Items to Keep Out',
        type: 'red',
        items: [
          'Food waste',
          'Plastic bags and film',
          'Polystyrene foam',
          'Aluminum food pans',
          'Household garbage'
        ]
      },
      {
        heading: 'When You Are Not Sure',
        type: 'orange',
        items: [
          'Check the item before putting it in the recycling cart.',
          'Use the WhichBin Orlando item search to help decide where an item belongs.'
        ]
      }
    ]
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
          <section
            key={section.heading}
            className={`resource-section resource-section-${section.type}`}
          >
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