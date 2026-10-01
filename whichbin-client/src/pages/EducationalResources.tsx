import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSettings,
  FiAlertTriangle,
  FiFileText,
  FiChevronRight,
  FiAward,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import {
  getResources,
  type Resource,
} from '../services/resourceService'
import {
  getTriviaChallenges,
  type TriviaChallenge,
} from '../services/triviaService'
import PageLayout from '../components/PageLayout'
import './EducationalResources.css'

type ResourceFilter = 'all' | 'articles' | 'trivia'

function EducationalResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [triviaChallenges, setTriviaChallenges] = useState<TriviaChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ResourceFilter>('all')

  useEffect(() => {
    let isMounted = true

    Promise.all([getResources(), getTriviaChallenges()])
      .then(([resourceData, triviaData]) => {
        if (!isMounted) {
          return
        }

        setResources(resourceData ?? [])
        setTriviaChallenges(triviaData ?? [])
        setLoading(false)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setResources([])
        setTriviaChallenges([])
        setLoading(false)
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

    if (resource.styleType === 'resource-style-teal') {
      return <FiAward />
    }

    return <FaRecycle />
  }

  const articleResources = resources

  const showArticles = filter === 'all' || filter === 'articles'
  const showTrivia = filter === 'all' || filter === 'trivia'

  if (loading) {
    return (
      <PageLayout className="resources-page" width="wide">
        <h1>Educational Resources</h1>

        <p className="resources-intro">
          Learn more about recycling and how to make a bigger impact.
        </p>

        <p className="resources-intro">Loading resources...</p>
      </PageLayout>
    )
  }

  if (!articleResources.length && !triviaChallenges.length) {
    return (
      <PageLayout className="resources-page" width="wide">
        <h1>Educational Resources</h1>

        <p className="resources-intro">
          Learn more about recycling and how to make a bigger impact.
        </p>

        <p className="resources-intro">
          No educational resources are available right now.
        </p>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="resources-page" width="wide">
      <h1>Educational Resources</h1>

      <p className="resources-intro">
        Learn more about recycling and how to make a bigger impact.
      </p>

      <div className="resources-filter" role="group" aria-label="Resource type">
        <button
          type="button"
          className={filter === 'all' ? 'resources-filter-active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>

        <button
          type="button"
          className={filter === 'articles' ? 'resources-filter-active' : ''}
          onClick={() => setFilter('articles')}
        >
          Articles
        </button>

        <button
          type="button"
          className={filter === 'trivia' ? 'resources-filter-active' : ''}
          onClick={() => setFilter('trivia')}
        >
          Trivia
        </button>
      </div>

      {showArticles && articleResources.length > 0 && (
        <section className="resources-section">
          {filter === 'all' && <h2>Articles</h2>}

          <div className="resources-list">
            {articleResources.map((resource) => (
              <Link
                to={`/resources/${resource.id}`}
                className="resource-card"
                key={`resource-${resource.id}`}
              >
                <div
                  className={`resource-icon ${resource.styleType ?? ''}`}
                >
                  {getIcon(resource)}
                </div>

                <div className="resource-content">
                  <span className="resource-type-label">Article</span>

                  <h2>{resource.title}</h2>

                  <p>{resource.description}</p>
                </div>

                <div className="resource-arrow">
                  <FiChevronRight />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showTrivia && triviaChallenges.length > 0 && (
        <section className="resources-section">
          {filter === 'all' && <h2>Trivia</h2>}

          <div className="resources-list">
            {triviaChallenges.map((challenge) => (
              <Link
                to={`/resources/trivia/${challenge.id}`}
                className="resource-card"
                key={`trivia-${challenge.id}`}
              >
                <div className="resource-icon resource-style-green">
                  <FaRecycle />
                </div>

                <div className="resource-content">
                  <span className="resource-type-label">Trivia</span>

                  <h2>{challenge.title}</h2>

                  <p>{challenge.description}</p>
                </div>

                <div className="resource-arrow">
                  <FiChevronRight />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  )
}

export default EducationalResources