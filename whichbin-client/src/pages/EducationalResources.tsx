import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSettings, FiAlertTriangle, FiFileText, FiChevronRight } from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import { getResources, type Resource } from '../services/resourceService'
import PageLayout from '../components/PageLayout'
import './EducationalResources.css'

function EducationalResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getResources()
      .then((data) => {
        if (isMounted) {
          setResources(data ?? [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setResources([])
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
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
      <PageLayout className="resources-page" width="wide">
        <h1>Educational Resources</h1>
        <p className="resources-intro">Loading resources...</p>
      </PageLayout>
    )
  }

  if (!resources.length) {
    return (
      <PageLayout className="resources-page" width="wide">
        <h1>Educational Resources</h1>
        <p className="resources-intro">No educational resources are available right now.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="resources-page" width="wide">
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
            <div className={`resource-icon ${resource.styleType ?? ''}`}>
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
    </PageLayout>
  )
}

export default EducationalResources
