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
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import {
	createResource,
	deleteResource,
	getResources,
	updateResource,
	type Resource,
	type ResourceSection,
} from '../../services/resourceService'
import './AdminSection.css'

type StyleOption = {
	value: string
	color: string
	background: string
	label: string
	icon: ReactNode
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

	useEffect(() => {
		loadResources()
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

	async function handleDelete(resource: Resource) {
		if (editingResource) {
			return
		}

		const confirmed = window.confirm(
			`Are you sure you want to delete "${resource.title}"?`
		)

		if (!confirmed) {
			return
		}

		const success = await deleteResource(resource.id)

		if (!success) {
			window.alert('The resource could not be deleted.')
			return
		}

		setResources((current) =>
			current.filter((item) => item.id !== resource.id)
		)
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
													key={
														option.value
													}
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

	return (
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
						Add, edit, or remove educational resources for
						WhichBin Orlando.
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
																handleDelete(
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
				</div>
			</div>
		</PageLayout>
	)
}