
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSettings,
  FiAlertTriangle,
  FiFileText,
  FiChevronRight,
  FiAward,
  FiBookOpen,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import {
  getResources,
  type Resource,
} from '../../services/resourceService'
import {
  getPaginatedTriviaChallenges,
  type TriviaChallenge,
} from '../../services/triviaService'
import PageLayout from '../../components/PageLayout'
import Pagination from '../../components/Pagination/Pagination'
import './EducationalResources.css'
import '../Announcements/Announcements.css'

type ResourceFilter = 'all' | 'articles' | 'trivia'

function EducationalResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [triviaChallenges, setTriviaChallenges] = useState<TriviaChallenge[]>([])

  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [triviaLoading, setTriviaLoading] = useState(true)

  const [filter, setFilter] = useState<ResourceFilter>('all')

  // Article pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState<number | null>(null)

  // Trivia pagination
  const [triviaCurrentPage, setTriviaCurrentPage] = useState(1)
  const [triviaPageSize, setTriviaPageSize] = useState(5)
  const [triviaTotalItems, setTriviaTotalItems] = useState<number | null>(null)

  // Load paginated educational articles
  useEffect(() => {
    const controller = new AbortController()

    setResourcesLoading(true)

    getResources(currentPage, pageSize, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return
        }

        if (result) {
          setResources(result.items ?? [])
          setTotalItems(result.totalItems)
        } else {
          setResources([])
          setTotalItems(0)
        }

        setResourcesLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }

        setResources([])
        setTotalItems(0)
        setResourcesLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [currentPage, pageSize])

  // Load paginated trivia challenges
  useEffect(() => {
    const controller = new AbortController()

    setTriviaLoading(true)

    getPaginatedTriviaChallenges(
      triviaCurrentPage,
      triviaPageSize,
      controller.signal
    )
      .then((result) => {
        if (controller.signal.aborted) {
          return
        }

        if (result) {
          setTriviaChallenges(result.items ?? [])
          setTriviaTotalItems(result.totalItems)
        } else {
          setTriviaChallenges([])
          setTriviaTotalItems(0)
        }

        setTriviaLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }

        setTriviaChallenges([])
        setTriviaTotalItems(0)
        setTriviaLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [triviaCurrentPage, triviaPageSize])

  // Article pagination handlers
  function handlePageChange(page: number) {
    setCurrentPage(page)
  }

  function handlePageSizeChange(newPageSize: number) {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Trivia pagination handlers
  function handleTriviaPageChange(page: number) {
    setTriviaCurrentPage(page)
  }

  function handleTriviaPageSizeChange(newPageSize: number) {
    setTriviaPageSize(newPageSize)
    setTriviaCurrentPage(1)
  }

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

  const pageHeader = (
    <div className="announcements-header">
      <div className="announcements-heading-icon">
        <FiBookOpen aria-hidden="true" />
      </div>

      <div>
        <h1>Educational Resources</h1>
        <p className="resources-intro">
          Learn more about recycling and how to make a bigger impact.
        </p>
      </div>
    </div>
  )

  const showArticles = filter === 'all' || filter === 'articles'
  const showTrivia = filter === 'all' || filter === 'trivia'

  if (resourcesLoading || triviaLoading) {
    return (
      <PageLayout className="resources-page" width="wide">
        {pageHeader}
        <p className="resources-intro">Loading resources...</p>
      </PageLayout>
    )
  }

  if (totalItems === 0 && triviaTotalItems === 0) {
    return (
      <PageLayout className="resources-page" width="wide">
        {pageHeader}
        <p className="resources-intro">
          No educational resources are available right now.
        </p>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="resources-page" width="wide">
      {pageHeader}

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

      {/* Educational Articles */}
      {showArticles && (resources.length > 0 || (totalItems ?? 0) > 0) && (
        <section className="resources-section">
          {filter === 'all' && <h2>Articles</h2>}

          <div className="resources-list">
            {resources.map((resource) => (
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

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20]}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            displayName="resources"
          />
        </section>
      )}

      {/* Trivia Challenges */}
      {showTrivia && (triviaChallenges.length > 0 || (triviaTotalItems ?? 0) > 0) && (
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

          <Pagination
            currentPage={triviaCurrentPage}
            totalItems={triviaTotalItems}
            pageSize={triviaPageSize}
            pageSizeOptions={[5, 10, 20]}
            onPageChange={handleTriviaPageChange}
            onPageSizeChange={handleTriviaPageSizeChange}
            displayName="trivia challenges"
          />
        </section>
      )}
    </PageLayout>
  )
}

export default EducationalResources
