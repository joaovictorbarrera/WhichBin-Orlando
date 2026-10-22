import { useEffect } from 'react'
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import './DeleteConfirmModal.css'

type DeleteConfirmModalProps = {
	title: string
	itemName: string
	description: string
	confirmLabel: string
	loading?: boolean
	onCancel: () => void
	onConfirm: () => void
}

export default function DeleteConfirmModal({
	title,
	itemName,
	description,
	confirmLabel,
	loading = false,
	onCancel,
	onConfirm,
}: DeleteConfirmModalProps) {
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape' && !loading) {
				onCancel()
			}
		}

		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [loading, onCancel])

	return createPortal(
		<div
			className="delete-confirm-overlay"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && !loading) {
					onCancel()
				}
			}}
		>
			<div
				className="delete-confirm-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-confirm-title"
				aria-describedby="delete-confirm-description"
			>
				<div className="delete-confirm-header">
					<div className="delete-confirm-icon">
						<FiAlertTriangle />
					</div>

					<button
						type="button"
						className="delete-confirm-close"
						onClick={onCancel}
						disabled={loading}
						aria-label="Close confirmation"
					>
						<FiX />
					</button>
				</div>

				<div className="delete-confirm-content">
					<h2 id="delete-confirm-title">{title}</h2>

					<p className="delete-confirm-item">
						{itemName}
					</p>

					<p id="delete-confirm-description">
						{description}
					</p>
				</div>

				<div className="delete-confirm-actions">
					<button
						type="button"
						className="delete-confirm-cancel"
						onClick={onCancel}
						disabled={loading}
					>
						Cancel
					</button>

					<button
						type="button"
						className="delete-confirm-delete"
						onClick={onConfirm}
						disabled={loading}
					>
						<FiTrash2 />

						{loading ? 'Deleting...' : confirmLabel}
					</button>
				</div>
			</div>
		</div>,
		document.body
	)
}