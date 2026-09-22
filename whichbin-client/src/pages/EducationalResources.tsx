import { Link } from 'react-router-dom'
import './EducationalResources.css'

function EducationalResources() {
  const resources = [
    {
      id: 'recycling-basics',
      icon: '♻',
      title: 'Recycling Basics',
      description: 'The essentials of what can and cannot be recycled.',
    },
    {
      id: 'prepare-items',
      icon: '⚙',
      title: 'How to Prepare Items',
      description: 'Simple steps to make your items recyclable.',
    },
    {
      id: 'common-mistakes',
      icon: '⚠',
      title: 'Common Mistakes',
      description: 'Avoid these common recycling mistakes.',
    },
    {
      id: 'orlando-guide',
      icon: '📄',
      title: 'Orlando Recycling Guide',
      description: 'Full details from the City of Orlando.',
    },
  ]

  return (
    <main className="resources-page">
      <h1>Educational Resources</h1>

      <p className="resources-intro">
        Learn more about recycling and how to make a bigger impact.
      </p>

      <div className="resources-list">
        {resources.map((resource) => (
          <Link
            to={`/resources/${resource.id}`}
            className="resource-card"
            key={resource.id}
          >
            <div className="resource-icon">
              {resource.icon}
            </div>

            <div className="resource-content">
              <h2>{resource.title}</h2>
              <p>{resource.description}</p>
            </div>

            <div className="resource-arrow">
              ›
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default EducationalResources