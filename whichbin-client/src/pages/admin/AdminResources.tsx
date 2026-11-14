import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
        FiAlertTriangle,
        FiArrowLeft,
        FiEdit,
        FiFileText,
        FiPackage,
        FiPlus,
        FiTrash2,
        FiChevronDown,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import Pagination from '../../components/Pagination/Pagination'
import {
        createResource,
        deleteResource,
        getResources,
        updateResource,
        type Resource,
        type ResourceSection,
} from '../../services/resourceService'
import {
        createTriviaChallenge,
        createTriviaQuestionForChallenge,
        deleteTriviaChallenge,
        deleteTriviaQuestion,
        getAllTriviaChallenges,
        updateTriviaChallenge,
        updateTriviaQuestion,
        type CreateTriviaChallengeRequest,
        type CreateTriviaQuestionRequest,
        type TriviaChallenge,
        type TriviaQuestion,
} from '../../services/triviaService'
import { ResourceForm, ChallengeForm, TriviaForm } from './AdminResourceForms'
import './AdminSection.css'
import './AdminResources.css'

type StyleOption = {
        value: string
        color: string
        background: string
        label: string
        icon: ReactNode
}

type DeleteTarget = {
        type: 'resource' | 'challenge' | 'question'
        id: number
        title: string
}

const styleOptions: StyleOption[] = [
        {
                value: 'resource-style-green',
                color: '#2e7d32',
                background: '#e8f5e9',
                label: 'Green',
                icon: <FaRecycle />,
        },
        {
                value: 'resource-style-blue',
                color: '#1976d2',
                background: '#e3f2fd',
                label: 'Blue',
                icon: <FiPackage />,
        },
        {
                value: 'resource-style-orange',
                color: '#ef6c00',
                background: '#fff3e0',
                label: 'Orange',
                icon: <FiAlertTriangle />,
        },
        {
                value: 'resource-style-red',
                color: '#d32f2f',
                background: '#ffebee',
                label: 'Red',
                icon: <FiAlertTriangle />,
        },
]

const sectionStyleOptions = [
        {
                value: 'resource-section-green',
                color: '#2e7d32',
                label: 'Green',
        },
        {
                value: 'resource-section-blue',
                color: '#1976d2',
                label: 'Blue',
        },
        {
                value: 'resource-section-orange',
                color: '#ef6c00',
                label: 'Orange',
        },
        {
                value: 'resource-section-red',
                color: '#d32f2f',
                label: 'Red',
        },
]

const emptySection: ResourceSection = {
        heading: '',
        styleType: 'resource-section-green',
        items: '',
}

const emptyTriviaQuestion: CreateTriviaQuestionRequest = {
        question: '',
        answerA: '',
        answerB: '',
        answerC: '',
        answerD: '',
        correctAnswer: '',
}

const emptyTriviaChallenge: CreateTriviaChallengeRequest = {
        title: '',
        description: '',
}

export default function AdminResources() {
        const [resources, setResources] = useState<Resource[]>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(false)

        const [currentPage, setCurrentPage] = useState(1)
        const [pageSize, setPageSize] = useState(10)
        const [totalItems, setTotalItems] = useState<number | null>(null)
        const [resourceRefresh, setResourceRefresh] = useState(0)

        const [showAddForm, setShowAddForm] = useState(false)
        const [editingResource, setEditingResource] = useState<Resource | null>(null)
        const [saving, setSaving] = useState(false)
        const [formError, setFormError] = useState(false)

        const [title, setTitle] = useState('')
        const [description, setDescription] = useState('')
        const [content, setContent] = useState('')
        const [styleType, setStyleType] = useState('')
        const [pdfUrl, setPdfUrl] = useState('')

        const [sections, setSections] = useState<ResourceSection[]>([])

        const [showStyleDropdown, setShowStyleDropdown] = useState(false)

        const [triviaChallenges, setTriviaChallenges] = useState<
                TriviaChallenge[]
        >([])
        const [triviaLoading, setTriviaLoading] = useState(true)
        const [triviaError, setTriviaError] = useState(false)

        const [triviaCurrentPage, setTriviaCurrentPage] = useState(1)
        const [triviaPageSize, setTriviaPageSize] = useState(5)
        const [triviaTotalItems, setTriviaTotalItems] = useState<number | null>(
                null
        )
        const [triviaRefresh, setTriviaRefresh] = useState(0)

        const [showChallengeForm, setShowChallengeForm] = useState(false)
        const [editingTriviaChallenge, setEditingTriviaChallenge] =
                useState<TriviaChallenge | null>(null)
        const [savingChallenge, setSavingChallenge] = useState(false)
        const [challengeFormError, setChallengeFormError] = useState(false)

        const [challengeTitle, setChallengeTitle] = useState(
                emptyTriviaChallenge.title
        )
        const [challengeDescription, setChallengeDescription] = useState(
                emptyTriviaChallenge.description
        )
        const [challengeActive, setChallengeActive] = useState(false)

        const [expandedTriviaChallengeId, setExpandedTriviaChallengeId] = useState<
                number | null
        >(null)

        const [showTriviaForm, setShowTriviaForm] = useState(false)
        const [editingTrivia, setEditingTrivia] = useState<TriviaQuestion | null>(
                null
        )
        const [activeTriviaChallengeId, setActiveTriviaChallengeId] = useState<
                number | null
        >(null)
        const [savingTrivia, setSavingTrivia] = useState(false)
        const [triviaFormError, setTriviaFormError] = useState(false)

        const [triviaQuestion, setTriviaQuestion] = useState(
                emptyTriviaQuestion.question
        )
        const [answerA, setAnswerA] = useState(emptyTriviaQuestion.answerA)
        const [answerB, setAnswerB] = useState(emptyTriviaQuestion.answerB)
        const [answerC, setAnswerC] = useState(emptyTriviaQuestion.answerC)
        const [answerD, setAnswerD] = useState(emptyTriviaQuestion.answerD)
        const [correctAnswer, setCorrectAnswer] = useState(
                emptyTriviaQuestion.correctAnswer
        )

        const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(
                null
        )
        const [deleting, setDeleting] = useState(false)

        useEffect(() => {
                const controller = new AbortController()

                async function loadTriviaChallenges() {
                        setTriviaLoading(true)
                        setTriviaError(false)

                        try {
                                const result = await getAllTriviaChallenges(
                                        triviaCurrentPage,
                                        triviaPageSize,
                                        controller.signal
                                )

                                if (controller.signal.aborted) {
                                        return
                                }

                                if (result === null) {
                                        setTriviaError(true)
                                        setTriviaChallenges([])
                                        setTriviaTotalItems(null)
                                } else {
                                        setTriviaChallenges(result.items ?? [])
                                        setTriviaTotalItems(result.totalItems)

                                        const lastPage = Math.max(
                                                1,
                                                Math.ceil(
                                                        result.totalItems /
                                                                triviaPageSize
                                                )
                                        )

                                        if (triviaCurrentPage > lastPage) {
                                                setTriviaCurrentPage(lastPage)
                                        }
                                }
                        } catch (error) {
                                if (
                                        controller.signal.aborted ||
                                        (error instanceof DOMException &&
                                                error.name === 'AbortError')
                                ) {
                                        return
                                }

                                setTriviaError(true)
                                setTriviaChallenges([])
                                setTriviaTotalItems(null)
                        } finally {
                                if (!controller.signal.aborted) {
                                        setTriviaLoading(false)
                                }
                        }
                }

                loadTriviaChallenges()

                return () => {
                        controller.abort()
                }
        }, [triviaCurrentPage, triviaPageSize, triviaRefresh])

        useEffect(() => {
                const controller = new AbortController()

                async function loadResources() {
                        setLoading(true)
                        setError(false)

                        const result = await getResources(
                                currentPage,
                                pageSize,
                                controller.signal
                        )

                        if (controller.signal.aborted) {
                                return
                        }

                        if (result === null) {
                                setError(true)
                                setResources([])
                                setTotalItems(null)
                        } else {
                                setResources(result.items ?? [])
                                setTotalItems(result.totalItems)
                        }

                        setLoading(false)
                }

                loadResources()

                return () => {
                        controller.abort()
                }
        }, [currentPage, pageSize, resourceRefresh])

        function handlePageChange(page: number) {
                setCurrentPage(page)
        }

        function handlePageSizeChange(newPageSize: number) {
                setPageSize(newPageSize)
                setCurrentPage(1)
        }

        function handleTriviaPageChange(page: number) {
                setTriviaCurrentPage(page)
        }

        function handleTriviaPageSizeChange(newPageSize: number) {
                setTriviaPageSize(newPageSize)
                setTriviaCurrentPage(1)
        }

        function requestDeleteResource(resource: Resource) {
                if (editingResource) {
                        return
                }

                setDeleteTarget({
                        type: 'resource',
                        id: resource.id,
                        title: resource.title,
                })
        }

        function requestDeleteTriviaChallenge(challenge: TriviaChallenge) {
                if (
                        editingTrivia ||
                        showTriviaForm ||
                        showChallengeForm ||
                        editingTriviaChallenge
                ) {
                        return
                }

                setDeleteTarget({
                        type: 'challenge',
                        id: challenge.id,
                        title: challenge.title,
                })
        }

        function requestDeleteTrivia(question: TriviaQuestion) {
                if (editingTrivia || editingTriviaChallenge) {
                        return
                }

                setDeleteTarget({
                        type: 'question',
                        id: question.id,
                        title: question.question,
                })
        }

        function handleCloseDeleteModal() {
                if (deleting) {
                        return
                }

                setDeleteTarget(null)
        }

        async function handleConfirmDelete() {
                if (!deleteTarget || deleting) {
                        return
                }

                setDeleting(true)

                if (deleteTarget.type === 'resource') {
                        const success = await deleteResource(deleteTarget.id)

                        if (!success) {
                                window.alert('The resource could not be deleted.')
                                setDeleting(false)
                                return
                        }

                        const newTotal = Math.max((totalItems ?? 0) - 1, 0)
                        setTotalItems(newTotal)

                        const lastPage = Math.max(1, Math.ceil(newTotal / pageSize))
                        if (currentPage > lastPage) {
                                setCurrentPage(lastPage)
                        }

                        setResourceRefresh((current) => current + 1)
                }

                if (deleteTarget.type === 'question') {
                        const success = await deleteTriviaQuestion(deleteTarget.id)

                        if (!success) {
                                window.alert('The trivia question could not be deleted.')
                                setDeleting(false)
                                return
                        }

                        setTriviaChallenges((current) =>
                                current.map((challenge) => ({
                                        ...challenge,
                                        questions: challenge.questions.filter(
                                                (item) => item.id !== deleteTarget.id
                                        ),
                                }))
                        )
                }

                if (deleteTarget.type === 'challenge') {
                        const success = await deleteTriviaChallenge(deleteTarget.id)

                        if (!success) {
                                window.alert(
                                        'The trivia challenge could not be deleted.'
                                )
                                setDeleting(false)
                                return
                        }

                        const newTotal = Math.max(
                                (triviaTotalItems ?? 0) - 1,
                                0
                        )

                        setTriviaTotalItems(newTotal)

                        const lastPage = Math.max(
                                1,
                                Math.ceil(newTotal / triviaPageSize)
                        )

                        if (triviaCurrentPage > lastPage) {
                                setTriviaCurrentPage(lastPage)
                        }

                        setTriviaRefresh((current) => current + 1)

                        if (expandedTriviaChallengeId === deleteTarget.id) {
                                setExpandedTriviaChallengeId(null)
                        }
                }

                setDeleting(false)
                setDeleteTarget(null)
        }

        function handleCancelAdd() {
                setShowAddForm(false)
                setEditingResource(null)
                setTitle('')
                setDescription('')
                setContent('')
                setStyleType('')
                setPdfUrl('')
                setSections([])
                setFormError(false)
                setShowStyleDropdown(false)
        }

        function handleStyleSelect(value: string) {
                setStyleType(value)
                setShowStyleDropdown(false)
        }

        function handleSectionChange(
                index: number,
                field: keyof ResourceSection,
                value: string
        ) {
                setSections((current) =>
                        current.map((section, sectionIndex) =>
                                sectionIndex === index
                                        ? {
                                                        ...section,
                                                        [field]: value,
                                                }
                                        : section
                        )
                )
        }

        function handleAddSection() {
                setSections((current) => [...current, { ...emptySection }])
        }

        function handleRemoveSection(index: number) {
                setSections((current) =>
                        current.filter((_, sectionIndex) => sectionIndex !== index)
                )
        }

        function handleMoveSectionUp(index: number) {
                if (index === 0) {
                        return
                }

                setSections((current) => {
                        const updatedSections = [...current]
                        const currentSection = updatedSections[index]
                        updatedSections[index] = updatedSections[index - 1]
                        updatedSections[index - 1] = currentSection
                        return updatedSections
                })
        }

        function handleMoveSectionDown(index: number) {
                setSections((current) => {
                        if (index === current.length - 1) {
                                return current
                        }

                        const updatedSections = [...current]
                        const currentSection = updatedSections[index]
                        updatedSections[index] = updatedSections[index + 1]
                        updatedSections[index + 1] = currentSection
                        return updatedSections
                })
        }

        function startAddResource() {
                if (editingResource) {
                        return
                }

                setEditingResource(null)
                setTitle('')
                setDescription('')
                setContent('')
                setStyleType('')
                setPdfUrl('')
                setSections([])
                setFormError(false)
                setShowStyleDropdown(false)
                setShowAddForm(true)
        }

        function startEditResource(resource: Resource) {
                if (editingResource) {
                        return
                }

                setEditingResource(resource)
                setShowAddForm(true)
                setTitle(resource.title)
                setDescription(resource.description)
                setContent(resource.content)
                setStyleType(resource.styleType)
                setPdfUrl(resource.pdfUrl ?? '')

                setSections(
                        (resource.sections ?? []).map((section) => ({
                                ...section,
                                items: section.items.split('|').join('\n'),
                                styleType:
                                        section.styleType || 'resource-section-green',
                        }))
                )

                setFormError(false)
                setShowStyleDropdown(false)
        }

        async function handleAddResource(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (
                !title.trim() ||
                !description.trim() ||
                !content.trim() ||
                !styleType
        ) {
                setFormError(true)
                return
        }

        // Clean up all resource sections before saving.
        const cleanedSections = sections.map((section) => ({
                heading: section.heading.trim(),
                styleType: section.styleType,
                items: section.items
                        .split(/\r?\n|\|/)
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .join('|'),
        }))

        // Every section that has been added must have a heading
        // and at least one item.
        const hasIncompleteSection = cleanedSections.some(
                (section) => !section.heading || !section.items
        )

        // Stop the save if any section is incomplete.
        // Do not silently remove incomplete sections.
        if (hasIncompleteSection) {
                setFormError(true)
                return
        }

        setSaving(true)
        setFormError(false)

        if (editingResource) {
                const updatedResource = await updateResource(editingResource.id, {
                        title: title.trim(),
                        description: description.trim(),
                        content: content.trim(),
                        styleType,
                        pdfUrl: pdfUrl.trim() || null,
                        sections: cleanedSections,
                })

                if (!updatedResource) {
                        setFormError(true)
                        setSaving(false)
                        return
                }

                setResources((current) =>
                        current.map((resource) =>
                                resource.id === updatedResource.id
                                        ? updatedResource
                                        : resource
                        )
                )
        } else {
                const newResource = await createResource({
                        title: title.trim(),
                        description: description.trim(),
                        content: content.trim(),
                        styleType,
                        pdfUrl: pdfUrl.trim() || null,
                        sections: cleanedSections,
                })

                if (!newResource) {
                        setFormError(true)
                        setSaving(false)
                        return
                }

                const newTotal = (totalItems ?? 0) + 1
                setTotalItems(newTotal)

                const lastPage = Math.max(1, Math.ceil(newTotal / pageSize))
                setCurrentPage(lastPage)
                setResourceRefresh((current) => current + 1)
        }

        setSaving(false)
        handleCancelAdd()
}

        function resetChallengeForm() {
                setChallengeTitle('')
                setChallengeDescription('')
                setChallengeActive(false)
                setChallengeFormError(false)
                setEditingTriviaChallenge(null)
        }

        function startAddChallenge() {
                if (
                        showTriviaForm ||
                        editingTrivia ||
                        editingTriviaChallenge
                ) {
                        return
                }

                resetChallengeForm()
                setShowChallengeForm(true)
        }

        function startEditChallenge(challenge: TriviaChallenge) {
                if (
                        showTriviaForm ||
                        editingTrivia ||
                        showChallengeForm ||
                        editingTriviaChallenge
                ) {
                        return
                }

                setEditingTriviaChallenge(challenge)
                setChallengeTitle(challenge.title)
                setChallengeDescription(challenge.description)
                setChallengeActive(challenge.active)
                setChallengeFormError(false)
                setShowChallengeForm(true)
        }

        function handleCancelChallenge() {
                setShowChallengeForm(false)
                resetChallengeForm()
        }

        async function handleSaveChallenge(event: FormEvent<HTMLFormElement>) {
                event.preventDefault()

                if (!challengeTitle.trim() || !challengeDescription.trim()) {
                        setChallengeFormError(true)
                        return
                }

                const challengeData: CreateTriviaChallengeRequest = {
                        title: challengeTitle.trim(),
                        description: challengeDescription.trim(),
                }

                setSavingChallenge(true)
                setChallengeFormError(false)

                if (editingTriviaChallenge) {
                        const updatedChallenge = await updateTriviaChallenge(
                                editingTriviaChallenge.id,
                                {
                                        ...challengeData,
                                        active: challengeActive,
                                }
                        )

                        if (!updatedChallenge) {
                                setChallengeFormError(true)
                                setSavingChallenge(false)
                                return
                        }

                        setTriviaChallenges((current) =>
                                current.map((challenge) =>
                                        challenge.id === updatedChallenge.id
                                                ? {
                                                                ...updatedChallenge,
                                                                questions: challenge.questions,
                                                        }
                                                : challenge
                                )
                        )

                        setTriviaRefresh((current) => current + 1)
                } else {
                        const newChallenge = await createTriviaChallenge(challengeData)

                        if (!newChallenge) {
                                setChallengeFormError(true)
                                setSavingChallenge(false)
                                return
                        }

                        const newTotal = (triviaTotalItems ?? 0) + 1
                        setTriviaTotalItems(newTotal)

                        const lastPage = Math.max(
                                1,
                                Math.ceil(newTotal / triviaPageSize)
                        )

                        setTriviaCurrentPage(lastPage)
                        setTriviaRefresh((current) => current + 1)
                }

                setSavingChallenge(false)
                handleCancelChallenge()
        }

        function resetTriviaForm() {
                setEditingTrivia(null)
                setActiveTriviaChallengeId(null)
                setTriviaQuestion('')
                setAnswerA('')
                setAnswerB('')
                setAnswerC('')
                setAnswerD('')
                setCorrectAnswer('')
                setTriviaFormError(false)
        }

        function toggleTriviaChallenge(challengeId: number) {
                if (
                        showChallengeForm ||
                        showTriviaForm ||
                        editingTrivia ||
                        editingTriviaChallenge
                ) {
                        return
                }

                setExpandedTriviaChallengeId((current) =>
                        current === challengeId ? null : challengeId
                )
        }

        function startAddTrivia(challengeId: number) {
                if (
                        editingTrivia ||
                        showChallengeForm ||
                        editingTriviaChallenge
                ) {
                        return
                }

                resetTriviaForm()
                setExpandedTriviaChallengeId(challengeId)
                setActiveTriviaChallengeId(challengeId)
                setShowTriviaForm(true)
        }

        function startEditTrivia(
                question: TriviaQuestion,
                challengeId: number
        ) {
                if (
                        editingTrivia ||
                        showChallengeForm ||
                        editingTriviaChallenge
                ) {
                        return
                }

                setExpandedTriviaChallengeId(challengeId)
                setEditingTrivia(question)
                setActiveTriviaChallengeId(challengeId)
                setShowTriviaForm(true)
                setTriviaQuestion(question.question)
                setAnswerA(question.answerA)
                setAnswerB(question.answerB)
                setAnswerC(question.answerC)
                setAnswerD(question.answerD)
                setCorrectAnswer(question.correctAnswer)
                setTriviaFormError(false)
        }

        function handleCancelTrivia() {
                setShowTriviaForm(false)
                resetTriviaForm()
        }

        async function handleSaveTrivia(event: FormEvent<HTMLFormElement>) {
                event.preventDefault()

                if (
                        !triviaQuestion.trim() ||
                        !answerA.trim() ||
                        !answerB.trim() ||
                        !answerC.trim() ||
                        !answerD.trim() ||
                        !correctAnswer
                ) {
                        setTriviaFormError(true)
                        return
                }

                const triviaData: CreateTriviaQuestionRequest = {
                        question: triviaQuestion.trim(),
                        answerA: answerA.trim(),
                        answerB: answerB.trim(),
                        answerC: answerC.trim(),
                        answerD: answerD.trim(),
                        correctAnswer,
                }

                setSavingTrivia(true)
                setTriviaFormError(false)

                if (editingTrivia) {
                        const updatedQuestion = await updateTriviaQuestion(
                                editingTrivia.id,
                                triviaData
                        )

                        if (!updatedQuestion) {
                                setTriviaFormError(true)
                                setSavingTrivia(false)
                                return
                        }

                        setTriviaChallenges((current) =>
                                current.map((challenge) => ({
                                        ...challenge,
                                        questions: challenge.questions.map((question) =>
                                                question.id === updatedQuestion.id
                                                        ? updatedQuestion
                                                        : question
                                        ),
                                }))
                        )
                } else {
                        if (activeTriviaChallengeId === null) {
                                setTriviaFormError(true)
                                setSavingTrivia(false)
                                return
                        }

                        const newQuestion = await createTriviaQuestionForChallenge(
                                activeTriviaChallengeId,
                                triviaData
                        )

                        if (!newQuestion) {
                                setTriviaFormError(true)
                                setSavingTrivia(false)
                                return
                        }

                        setTriviaChallenges((current) =>
                                current.map((challenge) =>
                                        challenge.id === activeTriviaChallengeId
                                                ? {
                                                                ...challenge,
                                                                questions: [
                                                                        ...challenge.questions,
                                                                        newQuestion,
                                                                ],
                                                        }
                                                : challenge
                                )
                        )
                }

                setSavingTrivia(false)
                handleCancelTrivia()
        }

        const selectedStyle = styleOptions.find(
                (option) => option.value === styleType
        )

        const deleteDescription =
                deleteTarget?.type === 'challenge'
                        ? 'This will also delete all questions inside this challenge.'
                        : deleteTarget?.type === 'question'
                                ? 'This action cannot be undone.'
                                : 'This action cannot be undone.'

        const deleteLabel =
                deleteTarget?.type === 'challenge'
                        ? 'Delete Challenge'
                        : deleteTarget?.type === 'question'
                                ? 'Delete Question'
                                : 'Delete Resource'

        return (
                <>
                        <PageLayout
                                className="admin-section-page admin-section-resources"
                                width="wide"
                        >
                                <Link to="/admin" className="admin-section-back">
                                        <FiArrowLeft />
                                        Back to dashboard
                                </Link>

                                <section className="admin-management-header admin-resources-header">
                                        <div className="admin-management-heading admin-resources-heading">
                                                <span className="admin-section-icon">
                                                        <FiFileText />
                                                </span>
                                                <div>
                                                        <p className="admin-section-eyebrow">Admin workspace</p>
                                                        <h1>Manage Resources</h1>
                                                        <p>
                                                                Add, edit, or remove educational resources for WhichBin Orlando.
                                                        </p>
                                                </div>
                                        </div>
                                        <button
                                                type="button"
                                                className="admin-resource-add"
                                                onClick={startAddResource}
                                                disabled={Boolean(editingResource)}
                                        >
                                                <FiPlus />
                                                Add Resource
                                        </button>
                                </section>

                                <div className="admin-resources-content">

                                        {showAddForm && !editingResource && (
                                                <div className="admin-resource-new-form">
                                                        <ResourceForm {...{ editingResource, handleAddResource, handleCancelAdd, saving, title, setTitle, description, setDescription, content, setContent, pdfUrl, setPdfUrl, styleType, setStyleType, showStyleDropdown, setShowStyleDropdown, selectedStyle, styleOptions, sections, setSections, sectionStyleOptions, handleStyleSelect, handleSectionChange, handleAddSection, handleRemoveSection, handleMoveSectionUp, handleMoveSectionDown, formError }} isEditing={false} />
                                                </div>
                                        )}

                                        <div className="admin-resource-list-heading">
                                                <div>
                                                        <h2>Educational Resources</h2>
                                                        <p>Manage articles available to WhichBin Orlando residents.</p>
                                                </div>
                                                {!loading && !error && (
                                                        <span>
                                                                {totalItems ?? 0}{' '}
                                                                {totalItems === 1 ? 'resource' : 'resources'}
                                                        </span>
                                                )}
                                        </div>

                                        {loading && (
                                                <p className="admin-resource-status">
                                                        Loading resources...
                                                </p>
                                        )}

                                        {!loading && error && (
                                                <p className="admin-resource-status admin-resource-error">
                                                        Unable to load resources.
                                                </p>
                                        )}

                                        {!loading &&
                                                !error &&
                                                resources.length === 0 && (
                                                        <p className="admin-resource-status">
                                                                No resources have been created yet.
                                                        </p>
                                                )}

                                        {!loading &&
                                                !error &&
                                                resources.length > 0 && (
                                                        <div className="admin-resource-list">
                                                                {resources.map((resource) => {
                                                                        const isEditing =
                                                                                editingResource?.id ===
                                                                                resource.id

                                                                        return (
                                                                                <article
                                                                                        key={resource.id}
                                                                                        className={`admin-resource-card ${
                                                                                                isEditing
                                                                                                        ? 'admin-resource-card-editing'
                                                                                                        : ''
                                                                                        }`}
                                                                                >
                                                                                        {isEditing ? (
                                                                                                <ResourceForm {...{ editingResource, handleAddResource, handleCancelAdd, saving, title, setTitle, description, setDescription, content, setContent, pdfUrl, setPdfUrl, styleType, setStyleType, showStyleDropdown, setShowStyleDropdown, selectedStyle, styleOptions, sections, setSections, sectionStyleOptions, handleStyleSelect, handleSectionChange, handleAddSection, handleRemoveSection, handleMoveSectionUp, handleMoveSectionDown, formError }} isEditing={true} />
                                                                                        ) : (
                                                                                                <>
                                                                                                        <div className="admin-resource-card-content">
                                                                                                                <h2>
                                                                                                                        {
                                                                                                                                resource.title
                                                                                                                        }
                                                                                                                </h2>

                                                                                                                <p>
                                                                                                                        {
                                                                                                                                resource.description
                                                                                                                        }
                                                                                                                </p>
                                                                                                        </div>

                                                                                                        <div className="admin-resource-card-actions">
                                                                                                                <button
                                                                                                                        type="button"
                                                                                                                        onClick={() =>
                                                                                                                                startEditResource(
                                                                                                                                        resource
                                                                                                                                )
                                                                                                                        }
                                                                                                                        disabled={Boolean(
                                                                                                                                editingResource
                                                                                                                        )}
                                                                                                                >
                                                                                                                        <FiEdit />
                                                                                                                        Edit
                                                                                                                </button>

                                                                                                                <button
                                                                                                                        type="button"
                                                                                                                        className="admin-resource-delete"
                                                                                                                        onClick={() =>
                                                                                                                                requestDeleteResource(
                                                                                                                                        resource
                                                                                                                                )
                                                                                                                        }
                                                                                                                        disabled={Boolean(
                                                                                                                                editingResource
                                                                                                                        )}
                                                                                                                >
                                                                                                                        <FiTrash2 />
                                                                                                                        Delete
                                                                                                                </button>
                                                                                                        </div>
                                                                                                </>
                                                                                        )}
                                                                                </article>
                                                                        )
                                                                })}
                                                        </div>
                                                )}

                                        {!loading && !error && (
                                                <Pagination
                                                        currentPage={currentPage}
                                                        totalItems={totalItems}
                                                        pageSize={pageSize}
                                                        pageSizeOptions={[5, 10, 20]}
                                                        onPageChange={handlePageChange}
                                                        onPageSizeChange={handlePageSizeChange}
                                                        displayName="resources"
                                                />
                                        )}

                                        <div className="admin-resource-divider" />

                                        <div className="admin-resource-trivia-header">
                                                <div>
                                                        <p className="admin-resource-form-eyebrow">
                                                                Educational Activity
                                                        </p>

                                                        <h2>Trivia Challenges</h2>

                                                        <p>
                                                                Create separate trivia challenges
                                                                and manage the questions inside each
                                                                one.
                                                        </p>
                                                </div>

                                                <button
                                                        type="button"
                                                        className="admin-resource-add"
                                                        onClick={startAddChallenge}
                                                        disabled={
                                                                Boolean(editingTrivia) ||
                                                                showTriviaForm ||
                                                                showChallengeForm ||
                                                                Boolean(editingTriviaChallenge)
                                                        }
                                                >
                                                        <FiPlus />
                                                        Add Trivia Challenge
                                                </button>
                                        </div>

                                        {showChallengeForm && (
                                                <div className="admin-resource-new-form">
                                                        <ChallengeForm {...{ editingTriviaChallenge, handleSaveChallenge, handleCancelChallenge, savingChallenge, challengeTitle, setChallengeTitle, challengeDescription, setChallengeDescription, challengeActive, setChallengeActive, challengeFormError }} />
                                                </div>
                                        )}

                                        {triviaLoading && (
                                                <p className="admin-resource-status">
                                                        Loading trivia challenges...
                                                </p>
                                        )}

                                        {!triviaLoading && triviaError && (
                                                <p className="admin-resource-status admin-resource-error">
                                                        Unable to load trivia challenges.
                                                </p>
                                        )}

                                        {!triviaLoading &&
                                                !triviaError &&
                                                triviaChallenges.length === 0 && (
                                                        <p className="admin-resource-status">
                                                                No trivia challenges have been created
                                                                yet.
                                                        </p>
                                                )}

                                        {!triviaLoading &&
                                                !triviaError &&
                                                triviaChallenges.length > 0 && (
                                                        <div className="admin-resource-list">
                                                                {triviaChallenges.map((challenge) => {
                                                                        const isExpanded =
                                                                                expandedTriviaChallengeId ===
                                                                                challenge.id

                                                                        return (
                                                                                <section
                                                                                        key={challenge.id}
                                                                                        className={`admin-resource-card admin-resource-trivia-challenge ${
                                                                                                isExpanded
                                                                                                        ? 'admin-resource-trivia-challenge-expanded'
                                                                                                        : ''
                                                                                        }`}
                                                                                >
                                                                                        <div className="admin-resource-trivia-challenge-top-row">
                                                                                                <button
                                                                                                        type="button"
                                                                                                        className="admin-resource-trivia-trigger"
                                                                                                        onClick={() =>
                                                                                                                toggleTriviaChallenge(
                                                                                                                        challenge.id
                                                                                                                )
                                                                                                        }
                                                                                                        aria-expanded={
                                                                                                                isExpanded
                                                                                                        }
                                                                                                        disabled={
                                                                                                                Boolean(
                                                                                                                        editingTriviaChallenge
                                                                                                                ) ||
                                                                                                                Boolean(
                                                                                                                        editingTrivia
                                                                                                                ) ||
                                                                                                                showTriviaForm ||
                                                                                                                showChallengeForm
                                                                                                        }
                                                                                                >
                                                                                                        <div className="admin-resource-trivia-trigger-content">
                                                                                                                <div className="admin-resource-trivia-title-meta">
                                                                                                                        <p className="admin-resource-form-eyebrow">
                                                                                                                                Trivia Challenge
                                                                                                                        </p>

                                                                                                                        <span
                                                                                                                                className={`admin-resource-trivia-status ${
                                                                                                                                        challenge.active
                                                                                                                                                ? 'admin-resource-trivia-status-active'
                                                                                                                                                : 'admin-resource-trivia-status-inactive'
                                                                                                                                }`}
                                                                                                                        >
                                                                                                                                {challenge.active
                                                                                                                                        ? 'Active'
                                                                                                                                        : 'Inactive'}
                                                                                                                        </span>
                                                                                                                </div>

                                                                                                                <h2>
                                                                                                                        {
                                                                                                                                challenge.title
                                                                                                                        }
                                                                                                                </h2>

                                                                                                                <p>
                                                                                                                        {
                                                                                                                                challenge.description
                                                                                                                        }
                                                                                                                </p>
                                                                                                        </div>

                                                                                                        <div className="admin-resource-trivia-trigger-meta">
                                                                                                                <span>
                                                                                                                        {
                                                                                                                                challenge
                                                                                                                                        .questions
                                                                                                                                        .length
                                                                                                                        }{' '}
                                                                                                                        question
                                                                                                                        {challenge
                                                                                                                                .questions
                                                                                                                                .length ===
                                                                                                                        1
                                                                                                                                ? ''
                                                                                                                                : 's'}
                                                                                                                </span>

                                                                                                                <FiChevronDown
                                                                                                                        className={
                                                                                                                                isExpanded
                                                                                                                                        ? 'admin-resource-trivia-chevron-expanded'
                                                                                                                                        : ''
                                                                                                                        }
                                                                                                                />
                                                                                                        </div>
                                                                                                </button>

                                                                                                <div className="admin-resource-trivia-challenge-top-actions">
                                                                                                        <button
                                                                                                                type="button"
                                                                                                                onClick={() =>
                                                                                                                        startEditChallenge(
                                                                                                                                challenge
                                                                                                                        )
                                                                                                                }
                                                                                                                disabled={
                                                                                                                        Boolean(
                                                                                                                                editingTrivia
                                                                                                                        ) ||
                                                                                                                        showTriviaForm ||
                                                                                                                        showChallengeForm ||
                                                                                                                        Boolean(
                                                                                                                                editingTriviaChallenge
                                                                                                                        )
                                                                                                                }
                                                                                                        >
                                                                                                                <FiEdit />
                                                                                                                Edit
                                                                                                        </button>

                                                                                                        <button
                                                                                                                type="button"
                                                                                                                className="admin-resource-delete"
                                                                                                                onClick={() =>
                                                                                                                        requestDeleteTriviaChallenge(
                                                                                                                                challenge
                                                                                                                        )
                                                                                                                }
                                                                                                                disabled={
                                                                                                                        Boolean(
                                                                                                                                editingTrivia
                                                                                                                        ) ||
                                                                                                                        showTriviaForm ||
                                                                                                                        showChallengeForm ||
                                                                                                                        Boolean(
                                                                                                                                editingTriviaChallenge
                                                                                                                        )
                                                                                                                }
                                                                                                        >
                                                                                                                <FiTrash2 />
                                                                                                                Delete
                                                                                                        </button>
                                                                                                </div>
                                                                                        </div>

                                                                                        {isExpanded && (
                                                                                                <div className="admin-resource-trivia-challenge-body">
                                                                                                        <div className="admin-resource-trivia-header">
                                                                                                                <div>
                                                                                                                        <h3>
                                                                                                                                Questions
                                                                                                                        </h3>

                                                                                                                        <p>
                                                                                                                                Add,
                                                                                                                                edit,
                                                                                                                                or
                                                                                                                                remove
                                                                                                                                questions
                                                                                                                                for
                                                                                                                                this
                                                                                                                                challenge.
                                                                                                                        </p>
                                                                                                                </div>

                                                                                                                <button
                                                                                                                        type="button"
                                                                                                                        className="admin-resource-add"
                                                                                                                        onClick={() =>
                                                                                                                                startAddTrivia(
                                                                                                                                        challenge.id
                                                                                                                                )
                                                                                                                        }
                                                                                                                        disabled={
                                                                                                                                Boolean(
                                                                                                                                        editingTrivia
                                                                                                                                ) ||
                                                                                                                                showChallengeForm ||
                                                                                                                                Boolean(
                                                                                                                                        editingTriviaChallenge
                                                                                                                                )
                                                                                                                        }
                                                                                                                >
                                                                                                                        <FiPlus />
                                                                                                                        Add Trivia
                                                                                                                        Question
                                                                                                                </button>
                                                                                                        </div>

                                                                                                        {showTriviaForm &&
                                                                                                                !editingTrivia &&
                                                                                                                activeTriviaChallengeId ===
                                                                                                                        challenge.id && (
                                                                                                                        <div className="admin-resource-new-form">
                                                                                                                                {<TriviaForm {...{ handleSaveTrivia, handleCancelTrivia, savingTrivia, triviaQuestion, setTriviaQuestion, answerA, setAnswerA, answerB, setAnswerB, answerC, setAnswerC, answerD, setAnswerD, correctAnswer, setCorrectAnswer, triviaFormError }} isEditing={false} />}
                                                                                                                        </div>
                                                                                                                )}

                                                                                                        {challenge.questions
                                                                                                                .length === 0 ? (
                                                                                                                <p className="admin-resource-status">
                                                                                                                        No questions
                                                                                                                        have been added
                                                                                                                        to this
                                                                                                                        challenge yet.
                                                                                                                </p>
                                                                                                        ) : (
                                                                                                                <div className="admin-resource-list">
                                                                                                                        {challenge.questions.map(
                                                                                                                                (
                                                                                                                                        question
                                                                                                                                ) => {
                                                                                                                                        const isEditing =
                                                                                                                                                editingTrivia?.id ===
                                                                                                                                                question.id

                                                                                                                                        return (
                                                                                                                                                <article
                                                                                                                                                        key={
                                                                                                                                                                question.id
                                                                                                                                                        }
                                                                                                                                                        className={`admin-resource-card ${
                                                                                                                                                                isEditing
                                                                                                                                                                        ? 'admin-resource-card-editing'
                                                                                                                                                                        : ''
                                                                                                                                                        }`}
                                                                                                                                                >
                                                                                                                                                        {isEditing ? (
                                                                                                                                                                <TriviaForm {...{ handleSaveTrivia, handleCancelTrivia, savingTrivia, triviaQuestion, setTriviaQuestion, answerA, setAnswerA, answerB, setAnswerB, answerC, setAnswerC, answerD, setAnswerD, correctAnswer, setCorrectAnswer, triviaFormError }} isEditing={true} />
                                                                                                                                                        ) : (
                                                                                                                                                                <>
                                                                                                                                                                        <div className="admin-resource-card-content">
                                                                                                                                                                                <h2>
                                                                                                                                                                                        {
                                                                                                                                                                                                question.question
                                                                                                                                                                                        }
                                                                                                                                                                                </h2>

                                                                                                                                                                                <p>
                                                                                                                                                                                        <strong>
                                                                                                                                                                                                Correct Answer:
                                                                                                                                                                                        </strong>{' '}
                                                                                                                                                                                        {
                                                                                                                                                                                                question.correctAnswer
                                                                                                                                                                                        }
                                                                                                                                                                                </p>
                                                                                                                                                                        </div>

                                                                                                                                                                        <div className="admin-resource-card-actions">
                                                                                                                                                                                <button
                                                                                                                                                                                        type="button"
                                                                                                                                                                                        onClick={() =>
                                                                                                                                                                                                startEditTrivia(
                                                                                                                                                                                                        question,
                                                                                                                                                                                                        challenge.id
                                                                                                                                                                                                )
                                                                                                                                                                                        }
                                                                                                                                                                                        disabled={
                                                                                                                                                                                                Boolean(
                                                                                                                                                                                                        editingTrivia
                                                                                                                                                                                                ) ||
                                                                                                                                                                                                showChallengeForm ||
                                                                                                                                                                                                Boolean(
                                                                                                                                                                                                        editingTriviaChallenge
                                                                                                                                                                                                )
                                                                                                                                                                                        }
                                                                                                                                                                                >
                                                                                                                                                                                        <FiEdit />
                                                                                                                                                                                        Edit
                                                                                                                                                                                </button>

                                                                                                                                                                                <button
                                                                                                                                                                                        type="button"
                                                                                                                                                                                        className="admin-resource-delete"
                                                                                                                                                                                        onClick={() =>
                                                                                                                                                                                                requestDeleteTrivia(
                                                                                                                                                                                                        question
                                                                                                                                                                                                )
                                                                                                                                                                                        }
                                                                                                                                                                                        disabled={
                                                                                                                                                                                                Boolean(
                                                                                                                                                                                                        editingTrivia
                                                                                                                                                                                                ) ||
                                                                                                                                                                                                showChallengeForm ||
                                                                                                                                                                                                Boolean(
                                                                                                                                                                                                        editingTriviaChallenge
                                                                                                                                                                                                )
                                                                                                                                                                                        }
                                                                                                                                                                                >
                                                                                                                                                                                        <FiTrash2 />
                                                                                                                                                                                        Delete
                                                                                                                                                                                </button>
                                                                                                                                                                        </div>
                                                                                                                                                                </>
                                                                                                                                                        )}
                                                                                                                                                </article>
                                                                                                                                        )
                                                                                                                                }
                                                                                                                        )}
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>
                                                                                        )}
                                                                                </section>
                                                                        )
                                                                })}
                                                        </div>
                                                )}

                                        {!triviaLoading && !triviaError && (
                                                        <Pagination
                                                                currentPage={triviaCurrentPage}
                                                                totalItems={triviaTotalItems}
                                                                pageSize={triviaPageSize}
                                                                pageSizeOptions={[5, 10, 20]}
                                                                onPageChange={handleTriviaPageChange}
                                                                onPageSizeChange={
                                                                        handleTriviaPageSizeChange
                                                                }
                                                                displayName="trivia challenges"
                                                        />
                                                )}
                                </div>
                        </PageLayout>

                        {deleteTarget && (
                                <DeleteConfirmModal
                                        title={`Delete ${deleteTarget.type === 'challenge' ? 'Trivia Challenge' : deleteTarget.type === 'question' ? 'Trivia Question' : 'Resource'}?`}
                                        itemName={deleteTarget.title}
                                        description={deleteDescription}
                                        confirmLabel={deleteLabel}
                                        loading={deleting}
                                        onCancel={handleCloseDeleteModal}
                                        onConfirm={handleConfirmDelete}
                                />
                        )}
                </>
        )
}