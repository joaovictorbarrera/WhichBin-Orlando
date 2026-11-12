
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
        FiArrowLeft,
        FiCheckCircle,
        FiInfo,
        FiAlertTriangle,
        FiXCircle,
        FiList,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
import DetailStatus, {
        type DetailStatusType,
} from '../../components/DetailStatus'
import {
        getResourceById,
        type Resource,
} from '../../services/resourceService'
import { isNotFoundError } from '../../helpers/ErrorHelper'
import PageLayout from '../../components/PageLayout'
import './ResourceDetails.css'
import '../Announcements/Announcements.css'

type ResourceDetailState = DetailStatusType | 'success'

type ResourceDetailViewState = {
        resourceId: string | undefined
        status: ResourceDetailState
        resource: Resource | null
}

function ResourceDetails() {
        const { resourceId } = useParams()

        const [detailState, setDetailState] = useState<ResourceDetailViewState>({
                resourceId,
                status: resourceId ? 'loading' : 'failed',
                resource: null,
        })
        const [retryCount, setRetryCount] = useState(0)
        const status =
                detailState.resourceId === resourceId
                        ? detailState.status
                        : resourceId
                                ? 'loading'
                                : 'failed'
        const resource =
                detailState.resourceId === resourceId
                        ? detailState.resource
                        : null

        useEffect(() => {
                if (!resourceId) {
                        return
                }

                let isMounted = true

                getResourceById(resourceId)
                        .then((data) => {
                                if (isMounted) {
                                        setDetailState({
                                                resourceId,
                                                status: 'success',
                                                resource: data,
                                        })
                                }
                        })
                        .catch((error: unknown) => {
                                if (isMounted) {
                                        setDetailState({
                                                resourceId,
                                                status: isNotFoundError(error)
                                                        ? 'not-found'
                                                        : 'failed',
                                                resource: null,
                                        })
                                }
                        })

                return () => {
                        isMounted = false
                }
        }, [resourceId, retryCount])

        function getSectionIcon(styleType: string) {
                if (styleType.includes('blue')) {
                        return <FiInfo aria-hidden="true" />
                }

                if (styleType.includes('orange')) {
                        return <FiAlertTriangle aria-hidden="true" />
                }

                if (styleType.includes('red')) {
                        return <FiXCircle aria-hidden="true" />
                }

                return <FiCheckCircle aria-hidden="true" />
        }

        function getSectionClass(styleType: string) {
                if (styleType.includes('blue')) {
                        return 'resource-section resource-section-blue'
                }

                if (styleType.includes('orange')) {
                        return 'resource-section resource-section-orange'
                }

                if (styleType.includes('red')) {
                        return 'resource-section resource-section-red'
                }

                return 'resource-section resource-section-green'
        }

        if (status !== 'success' || !resource) {
                return (
                        <PageLayout
                                className="resource-details-page"
                                width="wide"
                        >
                                <Link
                                        to="/resources"
                                        className="resource-back-link"
                                >
                                        <FiArrowLeft aria-hidden="true" />
                                        Back to Educational Resources
                                </Link>

                                <DetailStatus
                                        featureName="resource"
                                        status={
                                                status === 'success'
                                                        ? 'failed'
                                                        : status
                                        }
                                        onRetry={() => {
                                                setDetailState({
                                                        resourceId,
                                                        status: 'loading',
                                                        resource: null,
                                                })
                                                setRetryCount((count) => count + 1)
                                        }}
                                />
                        </PageLayout>
                )
        }

        const articleContent = resource.content?.trim() ?? ''
        const resourceSections = resource.sections ?? []

        return (
                <PageLayout
                        className="resource-details-page"
                        width="wide"
                >
                        <Link
                                to="/resources"
                                className="resource-back-link"
                        >
                                <FiArrowLeft aria-hidden="true" />
                                Back to Educational Resources
                        </Link>

                        <div className="resource-details-card">
                                <div className="resource-hero resource-hero-green">
                                        <div className="resource-hero-icon">
                                                <FaRecycle aria-hidden="true" />
                                        </div>

                                        <div>
                                                <p className="resource-hero-label">
                                                        Educational Resource
                                                </p>

                                                <h1>{resource.title}</h1>

                                                <p>{resource.description}</p>
                                        </div>
                                </div>

                                {articleContent !== '' && (
                                        <section
                                                className="resource-article-content"
                                                aria-label="Article content"
                                        >
                                                <h2>Quick Summary</h2>

                                                <div className="resource-article-text">
                                                        {articleContent}
                                                </div>
                                        </section>
                                )}

                                <div className="resource-section-list">
                                        {resourceSections.map(
                                                (section, sectionIndex) => (
                                                        <section
                                                                className={getSectionClass(
                                                                        section.styleType
                                                                )}
                                                                key={`${section.heading}-${sectionIndex}`}
                                                        >
                                                                <div className="resource-section-heading">
                                                                        <div className="resource-section-icon">
                                                                                {getSectionIcon(
                                                                                        section.styleType
                                                                                )}
                                                                        </div>

                                                                        <div>
                                                                                <h2>{section.heading}</h2>
                                                                        </div>
                                                                </div>

                                                                <ul>
                                                                        {section.items
                                                                                .split('|')
                                                                                .map(
                                                                                        (
                                                                                                item,
                                                                                                itemIndex
                                                                                        ) => (
                                                                                                <li
                                                                                                        key={
                                                                                                                itemIndex
                                                                                                        }
                                                                                                >
                                                                                                        {item}
                                                                                                </li>
                                                                                        )
                                                                                )}
                                                                </ul>
                                                        </section>
                                                )
                                        )}
                                </div>

                                {resourceSections.length === 0 &&
                                        articleContent === '' && (
                                                <div className="resource-empty-message">
                                                        <FiList aria-hidden="true" />

                                                        <p>
                                                                No information has been added
                                                                to this resource yet.
                                                        </p>
                                                </div>
                                        )}

                                {resource.pdfUrl &&
                                        resource.pdfUrl.trim() !== '' && (
                                                <section className="resource-pdf">
                                                        <div className="resource-pdf-header">
                                                                <div>
                                                                        <span className="resource-pdf-label">
                                                                                PDF GUIDE
                                                                        </span>

                                                                        <h2>
                                                                                Additional
                                                                                Information
                                                                        </h2>

                                                                        <p>
                                                                                View the complete
                                                                                guide for this
                                                                                resource.
                                                                        </p>
                                                                </div>

                                                                <a
                                                                        href={resource.pdfUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="resource-pdf-button"
                                                                >
                                                                        Open PDF
                                                                </a>
                                                        </div>
                                                </section>
                                        )}
                        </div>
                </PageLayout>
        )
}

export default ResourceDetails
