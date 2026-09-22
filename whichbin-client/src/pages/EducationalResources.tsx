import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSettings, FiAlertTriangle, FiFileText, FiChevronRight } from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import './EducationalResources.css'

type Resource = {
  id: number
  title: string
  description: string
  content: string
  styleType: string
}

function EducationalResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/resources')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load resources')
        }

        return response.json()
      })
      .then((data) => {
        setResources(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Unable to load educational resources.')
        setLoading(false)
      })
  }, [])

  function getIcon(resource: Resource) {
    if (resource.styleType === 'resource-style-green') {
      return <FaRecycle />
    }

    if (resource.styleType === 'resource-style-blue') {
      return <FiSettings />
    }

    if (resource.styleType === 'resource-style-orange') {
      return <FiAlertTriangle />
    }

    if (resource.styleType === 'resource-style-purple') {
      return <FiFileText />
    }

    return <FaRecycle />
  }

  if (loading) {
    return (
      <main className="resources-page">
        <h1>Educational Resources</h1>
        <p className="resources-intro">Loading resources...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="resources-page">
        <h1>Educational Resources</h1>
        <p className="resources-intro">{error}</p>
      </main>
    )
  }

  return (
    <main className="resources-page">
      <h1>Educational Resources</h1>

      <p className="resources-intro">
        Learn more about recycling and how to make a bigger impact.
      </p>

      <div className="resources-list">
        {resources.map((resource) => (
          <Link
            to={'/resources/' + resource.id}
            className="resource-card"
            key={resource.id}
          >
            <div className="resource-icon">
              {getIcon(resource)}
            </div>

            <div className="resource-content">
              <h2>{resource.title}</h2>
              <p>{resource.description}</p>
            </div>

            <div className="resource-arrow">
              <FiChevronRight />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default EducationalResources