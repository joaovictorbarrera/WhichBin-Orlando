import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
	FiAlertTriangle,
	FiArrowLeft,
	FiEdit,
	FiFileText,
	FiPackage,
	FiPlus,
	FiTrash2,
	FiX,
	FiArrowUp,
	FiArrowDown,
	FiChevronDown,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
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
	getTriviaChallenges,
	updateTriviaChallenge,
	updateTriviaQuestion,
	type CreateTriviaChallengeRequest,
	type CreateTriviaQuestionRequest,
	type TriviaChallenge,
	type TriviaQuestion,
} from '../../services/triviaService'
import './AdminSection.css'

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
		loadResources()
		loadTriviaChallenges()
	}, [])

	async function loadResources() {
		setLoading(true)
		setError(false)

		const result = await getResources()

		if (result === null) {
			setError(true)
			setResources([])
		} else {
			setResources(result)
		}

		setLoading(false)
	}

	async function loadTriviaChallenges() {
		setTriviaLoading(true)
		setTriviaError(false)

		const result = await getTriviaChallenges()

		if (result === null) {
			setTriviaError(true)
			setTriviaChallenges([])
		} else {
			setTriviaChallenges(result)
		}

		setTriviaLoading(false)
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

			setResources((current) =>
				current.filter((item) => item.id !== deleteTarget.id)
			)
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

			setTriviaChallenges((current) =>
				current.filter((item) => item.id !== deleteTarget.id)
			)

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

		const cleanedSections = sections
			.map((section) => ({
				heading: section.heading.trim(),
				styleType: section.styleType,
				items: section.items
					.split(/\r?\n|\|/)
					.map((item) => item.trim())
					.filter(Boolean)
					.join('|'),
			}))
			.filter((section) => section.heading && section.items)

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

			setResources((current) => [...current, newResource])
		}

		setSaving(false)
		handleCancelAdd()
	}

	function resetChallengeForm() {
		setChallengeTitle('')
		setChallengeDescription('')
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
				challengeData
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
		} else {
			const newChallenge = await createTriviaChallenge(challengeData)

			if (!newChallenge) {
				setChallengeFormError(true)
				setSavingChallenge(false)
				return
			}

			setTriviaChallenges((current) => [
				...current,
				newChallenge,
			])
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

	function renderResourceForm(isEditing: boolean) {
		return (
			<form
				className="admin-resource-form admin-resource-form-inline"
				onSubmit={handleAddResource}
			>
				<div className="admin-resource-form-header">
					<div>
						{isEditing && (
							<p className="admin-resource-form-eyebrow">
								Editing Resource
							</p>
						)}

						<h2>
							{isEditing
								? editingResource?.title
								: 'Add Resource'}
						</h2>
					</div>

					<button
						type="button"
						className="admin-resource-form-close"
						onClick={handleCancelAdd}
						aria-label={
							isEditing
								? 'Cancel editing'
								: 'Close form'
						}
						disabled={saving}
					>
						<FiX />
					</button>
				</div>

				<label>
					Title
					<input
						type="text"
						value={title}
						onChange={(event) =>
							setTitle(event.target.value)
						}
					/>
				</label>

				<label>
					Description
					<input
						type="text"
						value={description}
						onChange={(event) =>
							setDescription(event.target.value)
						}
					/>
				</label>

				<label>
					Content
					<textarea
						value={content}
						onChange={(event) =>
							setContent(event.target.value)
						}
					/>
				</label>

				<label>
					PDF URL
					<input
						type="url"
						value={pdfUrl}
						onChange={(event) =>
							setPdfUrl(event.target.value)
						}
						placeholder="Optional PDF link"
					/>
					<small>
						Leave blank if this resource does not have a PDF.
					</small>
				</label>

				<label>
					Style Type

					<div className="admin-resource-style-dropdown">
						<button
							type="button"
							className="admin-resource-style-selected"
							onClick={() =>
								setShowStyleDropdown(
									(current) => !current
								)
							}
							aria-haspopup="listbox"
							aria-expanded={showStyleDropdown}
						>
							{selectedStyle ? (
								<>
									<span
										className="admin-resource-style-icon"
										style={{
											color: selectedStyle.color,
										}}
									>
										{selectedStyle.icon}
									</span>

									<span
										style={{
											color: selectedStyle.color,
										}}
									>
										{selectedStyle.label}
									</span>
								</>
							) : (
								<span className="admin-resource-style-placeholder">
									Select a style
								</span>
							)}
						</button>

						{showStyleDropdown && (
							<div
								className="admin-resource-style-options"
								role="listbox"
							>
								{styleOptions.map((option) => (
									<button
										key={option.value}
										type="button"
										className={`admin-resource-style-option ${
											styleType === option.value
												? 'admin-resource-style-option-selected'
												: ''
										}`}
										onClick={() =>
											handleStyleSelect(
												option.value
											)
										}
										role="option"
										aria-selected={
											styleType ===
											option.value
										}
										style={{
											backgroundColor:
												option.background,
											color: option.color,
										}}
									>
										<span
											className="admin-resource-style-icon"
											style={{
												color: option.color,
											}}
										>
											{option.icon}
										</span>

										<span>
											{option.label}
										</span>
									</button>
								))}
							</div>
						)}
					</div>
				</label>

				<div className="admin-resource-sections">
					<div className="admin-resource-sections-header">
						<div>
							<h3>Resource Sections</h3>

							<p>
								Add sections to organize the
								educational information.
							</p>
						</div>

						{sections.length === 0 && (
							<button
								type="button"
								className="admin-resource-add-section"
								onClick={handleAddSection}
							>
								<FiPlus />
								Add Section
							</button>
						)}
					</div>

					{sections.length === 0 && (
						<p className="admin-resource-no-sections">
							No sections added yet.
						</p>
					)}

					{sections.map((section, index) => {
						const sectionStyle =
							sectionStyleOptions.find(
								(option) =>
									option.value ===
									section.styleType
							)

						return (
							<div
								className="admin-resource-section-editor"
								key={index}
							>
								<div className="admin-resource-section-header">
									<h4>
										Section {index + 1}
									</h4>

									<div className="admin-resource-section-controls">
										<div className="admin-resource-section-order">
											<button
												type="button"
												onClick={() =>
													handleMoveSectionUp(
														index
													)
												}
												disabled={
													index === 0 ||
													saving
												}
												aria-label={`Move Section ${
													index + 1
												} up`}
												title="Move up"
											>
												<FiArrowUp />
											</button>

											<button
												type="button"
												onClick={() =>
													handleMoveSectionDown(
														index
													)
												}
												disabled={
													index ===
														sections.length - 1 ||
													saving
												}
												aria-label={`Move Section ${
													index + 1
												} down`}
												title="Move down"
											>
												<FiArrowDown />
											</button>
										</div>

										<button
											type="button"
											className="admin-resource-remove-section"
											onClick={() =>
												handleRemoveSection(
													index
												)
											}
											disabled={saving}
										>
											<FiTrash2 />
											Remove
										</button>
									</div>
								</div>

								<label>
									Heading
									<input
										type="text"
										value={section.heading}
										onChange={(event) =>
											handleSectionChange(
												index,
												'heading',
												event.target.value
											)
										}
										placeholder="Section heading"
									/>
								</label>

								<label>
									Style
									<select
										value={section.styleType}
										onChange={(event) =>
											handleSectionChange(
												index,
												'styleType',
												event.target.value
											)
										}
									>
										{sectionStyleOptions.map(
											(option) => (
												<option
													key={option.value}
													value={
														option.value
													}
												>
													{option.label}
												</option>
											)
										)}
									</select>

									{sectionStyle && (
										<span
											className="admin-resource-section-style-preview"
											style={{
												color: sectionStyle.color,
											}}
										>
											{sectionStyle.label}
										</span>
									)}
								</label>

								<label>
									Items
									<textarea
										value={section.items}
										onChange={(event) =>
											handleSectionChange(
												index,
												'items',
												event.target.value
											)
										}
										placeholder="Enter one item per line"
									/>
									<small>
										Enter one item per line.
									</small>
								</label>
							</div>
						)
					})}

					{sections.length > 0 && (
						<button
							type="button"
							className="admin-resource-add-section-bottom"
							onClick={handleAddSection}
							disabled={saving}
						>
							<FiPlus />
							Add Section
						</button>
					)}
				</div>

				{formError && (
					<p className="admin-resource-form-error">
						Please complete all required fields and try
						again.
					</p>
				)}

				<div className="admin-resource-form-actions">
					<button
						type="button"
						className="admin-resource-cancel"
						onClick={handleCancelAdd}
						disabled={saving}
					>
						Cancel
					</button>

					<button
						type="submit"
						className="admin-resource-save"
						disabled={saving}
					>
						{saving
							? 'Saving...'
							: isEditing
								? 'Update Resource'
								: 'Save Resource'}
					</button>
				</div>
			</form>
		)
	}

	function renderChallengeForm() {
		const isEditing = Boolean(editingTriviaChallenge)

		return (
			<form
				className="admin-resource-form admin-resource-form-inline"
				onSubmit={handleSaveChallenge}
			>
				<div className="admin-resource-form-header">
					<div>
						<p className="admin-resource-form-eyebrow">
							{isEditing
								? 'Editing Trivia Challenge'
								: 'Educational Activity'}
						</p>

						<h2>
							{isEditing
								? 'Edit Trivia Challenge'
								: 'Add Trivia Challenge'}
						</h2>
					</div>

					<button
						type="button"
						className="admin-resource-form-close"
						onClick={handleCancelChallenge}
						aria-label={
							isEditing
								? 'Cancel editing'
								: 'Close form'
						}
						disabled={savingChallenge}
					>
						<FiX />
					</button>
				</div>

				<label>
					Challenge Title
					<input
						type="text"
						value={challengeTitle}
						onChange={(event) =>
							setChallengeTitle(event.target.value)
						}
						placeholder="Enter the challenge title"
					/>
				</label>

				<label>
					Description
					<textarea
						value={challengeDescription}
						onChange={(event) =>
							setChallengeDescription(
								event.target.value
							)
						}
						placeholder="Describe what this challenge covers"
					/>
				</label>

				{challengeFormError && (
					<p className="admin-resource-form-error">
						Please enter a title and description for the
						challenge.
					</p>
				)}

				<div className="admin-resource-form-actions">
					<button
						type="button"
						className="admin-resource-cancel"
						onClick={handleCancelChallenge}
						disabled={savingChallenge}
					>
						Cancel
					</button>

					<button
						type="submit"
						className="admin-resource-save"
						disabled={savingChallenge}
					>
						{savingChallenge
							? 'Saving...'
							: isEditing
								? 'Update Challenge'
								: 'Save Challenge'}
					</button>
				</div>
			</form>
		)
	}

	function renderTriviaForm(isEditing: boolean) {
		return (
			<form
				className="admin-resource-form admin-resource-form-inline"
				onSubmit={handleSaveTrivia}
			>
				<div className="admin-resource-form-header">
					<div>
						{isEditing && (
							<p className="admin-resource-form-eyebrow">
								Editing Trivia Question
							</p>
						)}

						<h2>
							{isEditing
								? 'Edit Trivia Question'
								: 'Add Trivia Question'}
						</h2>
					</div>

					<button
						type="button"
						className="admin-resource-form-close"
						onClick={handleCancelTrivia}
						aria-label={
							isEditing
								? 'Cancel editing'
								: 'Close form'
						}
						disabled={savingTrivia}
					>
						<FiX />
					</button>
				</div>

				<label>
					Question
					<textarea
						value={triviaQuestion}
						onChange={(event) =>
							setTriviaQuestion(event.target.value)
						}
						placeholder="Enter the trivia question"
					/>
				</label>

				<label>
					Answer A
					<input
						type="text"
						value={answerA}
						onChange={(event) =>
							setAnswerA(event.target.value)
						}
						placeholder="Enter answer A"
					/>
				</label>

				<label>
					Answer B
					<input
						type="text"
						value={answerB}
						onChange={(event) =>
							setAnswerB(event.target.value)
						}
						placeholder="Enter answer B"
					/>
				</label>

				<label>
					Answer C
					<input
						type="text"
						value={answerC}
						onChange={(event) =>
							setAnswerC(event.target.value)
						}
						placeholder="Enter answer C"
					/>
				</label>

				<label>
					Answer D
					<input
						type="text"
						value={answerD}
						onChange={(event) =>
							setAnswerD(event.target.value)
						}
						placeholder="Enter answer D"
					/>
				</label>

				<label>
					Correct Answer
					<select
						value={correctAnswer}
						onChange={(event) =>
							setCorrectAnswer(event.target.value)
						}
					>
						<option value="">
							Select the correct answer
						</option>
						<option value={answerA}>
							{answerA || 'Answer A'}
						</option>
						<option value={answerB}>
							{answerB || 'Answer B'}
						</option>
						<option value={answerC}>
							{answerC || 'Answer C'}
						</option>
						<option value={answerD}>
							{answerD || 'Answer D'}
						</option>
					</select>
					<small>
						Choose the answer that should be marked
						correct.
					</small>
				</label>

				{triviaFormError && (
					<p className="admin-resource-form-error">
						Please complete all trivia fields and try again.
					</p>
				)}

				<div className="admin-resource-form-actions">
					<button
						type="button"
						className="admin-resource-cancel"
						onClick={handleCancelTrivia}
						disabled={savingTrivia}
					>
						Cancel
					</button>

					<button
						type="submit"
						className="admin-resource-save"
						disabled={savingTrivia}
					>
						{savingTrivia
							? 'Saving...'
							: isEditing
								? 'Update Question'
								: 'Save Question'}
					</button>
				</div>
			</form>
		)
	}

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
			<PageLayout>
				<div className="admin-section-page">
					<Link to="/admin" className="admin-section-back">
						<FiArrowLeft />
						Back to Admin
					</Link>

					<div className="admin-section-panel admin-section-resources">
						<div className="admin-section-icon">
							<FiFileText />
						</div>

						<p className="admin-section-eyebrow">Admin</p>

						<h1>Educational Resources</h1>

						<p>
							Add, edit, or remove educational resources
							for WhichBin Orlando.
						</p>

						<div className="admin-resource-actions">
							<button
								type="button"
								className="admin-resource-add"
								onClick={startAddResource}
								disabled={Boolean(editingResource)}
							>
								<FiPlus />
								Add Resource
							</button>
						</div>

						{showAddForm && !editingResource && (
							<div className="admin-resource-new-form">
								{renderResourceForm(false)}
							</div>
						)}

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
									No resources have been added yet.
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
													renderResourceForm(
														true
													)
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
								{renderChallengeForm()}
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
									No trivia challenges have been added
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
															<p className="admin-resource-form-eyebrow">
																Trivia Challenge
															</p>

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
																	{renderTriviaForm(
																		false
																	)}
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
																					renderTriviaForm(
																						true
																					)
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
					</div>
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