import CollectionState from '../../components/CollectionState'
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
  type ResourceListItem,
} from '../../services/resourceService'
import {
  getPaginatedTriviaChallenges,
  type TriviaChallengeListItem,
} from '../../services/triviaService'
import PageLayout from '../../components/PageLayout'
import Pagination from '../../components/Pagination/Pagination'
import './EducationalResources.css'
import '../Announcements/Announcements.css'

type ResourceFilter = 'all' | 'articles' | 'trivia'

type PageResult<T> =
  | { key: string; status: 'success'; items: T[]; totalItems: number }
  | { key: string; status: 'error' }

function EducationalResources() {
    const [resourcesResult, setResourcesResult] =
    useState<PageResult<ResourceListItem> | null>(null)
    const [triviaResult, setTriviaResult] =
    useState<PageResult<TriviaChallengeListItem> | null>(null)

  const [resourceRefresh, setResourceRefresh] = useState(0)
  const [triviaRefresh, setTriviaRefresh] = useState(0)
  const [lastResourceTotal, setLastResourceTotal] = useState<number | null>(null)
  const [lastTriviaTotal, setLastTriviaTotal] = useState<number | null>(null)

  const [filter, setFilter] = useState<ResourceFilter>('all')

  // Article pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // Trivia pagination
  const [triviaCurrentPage, setTriviaCurrentPage] = useState(1)
  const [triviaPageSize, setTriviaPageSize] = useState(4)

  // Load paginated educational articles
  useEffect(() => {
    const controller = new AbortController()
    const key = `${currentPage}:${pageSize}:${resourceRefresh}`

    getResources(currentPage, pageSize, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return
        }

        if (result) {
          setLastResourceTotal(result.totalItems)
          setResourcesResult({
            key,
            status: 'success',
            items: result.items ?? [],
            totalItems: result.totalItems,
          })
        } else {
          setResourcesResult({ key, status: 'error' })
        }
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }

        setResourcesResult({ key, status: 'error' })
      })

    return () => {
      controller.abort()
    }
  }, [currentPage, pageSize, resourceRefresh])

  // Load paginated trivia challenges
  useEffect(() => {
    const controller = new AbortController()
    const key = `${triviaCurrentPage}:${triviaPageSize}:${triviaRefresh}`

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
          setLastTriviaTotal(result.totalItems)
          setTriviaResult({
            key,
            status: 'success',
            items: result.items ?? [],
            totalItems: result.totalItems,
          })
        } else {
          setTriviaResult({ key, status: 'error' })
        }
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return
        }

        setTriviaResult({ key, status: 'error' })
      })

    return () => {
      controller.abort()
    }
  }, [triviaCurrentPage, triviaPageSize, triviaRefresh])

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

    function getIcon(resource: ResourceListItem) {
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
  const currentResourcesResult =
    resourcesResult?.key === `${currentPage}:${pageSize}:${resourceRefresh}`
      ? resourcesResult
      : null
  const currentTriviaResult =
    triviaResult?.key === `${triviaCurrentPage}:${triviaPageSize}:${triviaRefresh}`
      ? triviaResult
      : null
  const resourcesLoading = currentResourcesResult === null
  const triviaLoading = currentTriviaResult === null
  const resourcesUpdating =
    resourcesLoading && resourcesResult?.status === 'success'
  const triviaUpdating =
    triviaLoading && triviaResult?.status === 'success'
  const resourcesFailed = currentResourcesResult?.status === 'error'
  const triviaFailed = currentTriviaResult?.status === 'error'
  const resources =
    currentResourcesResult?.status === 'success'
      ? currentResourcesResult.items
      : resourcesUpdating && resourcesResult?.status === 'success'
        ? resourcesResult.items
        : []
  const triviaChallenges =
    currentTriviaResult?.status === 'success'
      ? currentTriviaResult.items
      : triviaUpdating && triviaResult?.status === 'success'
        ? triviaResult.items
        : []
  const totalItems =
    currentResourcesResult?.status === 'success'
      ? currentResourcesResult.totalItems
      : lastResourceTotal
  const triviaTotalItems =
    currentTriviaResult?.status === 'success'
      ? currentTriviaResult.totalItems
      : lastTriviaTotal

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
      {showArticles && (
        <section className="resources-section">
          {filter === 'all' && <h2>Articles</h2>}

          {resourcesLoading && !resourcesUpdating && <CollectionState state="loading" name="resources" />}
          {!resourcesLoading && resourcesFailed && <CollectionState state="error" name="resources" onRetry={() => setResourceRefresh((key) => key + 1)} />}
          {!resourcesLoading && !resourcesFailed && resources.length === 0 && (
            <CollectionState state="empty" name="resources" description="No articles are available right now." />
          )}

          <div className="resources-list collection-list">
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

          <div
            className={`announcements-loading-indicator${resourcesUpdating ? '' : ' is-hidden'}`}
            role={resourcesUpdating ? 'status' : undefined}
            aria-hidden={!resourcesUpdating}
          >
            {resourcesUpdating && (
              <>
                <span className="announcements-loading-spinner" aria-hidden="true" />
                Updating resources...
              </>
            )}
          </div>
          {totalItems !== null && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              pageSizeOptions={[6, 10, 20]}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              displayName="resources"
            />
          )}
        </section>
      )}

      {/* Trivia Challenges */}
      {showTrivia && (
        <section className="resources-section">
          {filter === 'all' && <h2>Trivia</h2>}

          {triviaLoading && !triviaUpdating && <CollectionState state="loading" name="trivia challenges" />}
          {!triviaLoading && triviaFailed && <CollectionState state="error" name="trivia challenges" onRetry={() => setTriviaRefresh((key) => key + 1)} />}
          {!triviaLoading && !triviaFailed && triviaChallenges.length === 0 && (
            <CollectionState state="empty" name="trivia challenges" description="No trivia challenges are available right now." />
          )}

          <div className="resources-list collection-list">
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

          <div
            className={`announcements-loading-indicator${triviaUpdating ? '' : ' is-hidden'}`}
            role={triviaUpdating ? 'status' : undefined}
            aria-hidden={!triviaUpdating}
          >
            {triviaUpdating && (
              <>
                <span className="announcements-loading-spinner" aria-hidden="true" />
                Updating trivia challenges...
              </>
            )}
          </div>
          {triviaTotalItems !== null && (
            <Pagination
              currentPage={triviaCurrentPage}
              totalItems={triviaTotalItems}
              pageSize={triviaPageSize}
              pageSizeOptions={[4, 10, 20]}
              onPageChange={handleTriviaPageChange}
              onPageSizeChange={handleTriviaPageSizeChange}
              displayName="challenges"
            />
          )}
        </section>
      )}
    </PageLayout>
  )
}

export default EducationalResources
