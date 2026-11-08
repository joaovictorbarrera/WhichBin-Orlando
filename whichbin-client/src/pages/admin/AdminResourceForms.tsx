import type {
        Dispatch,
        FormEvent,
        ReactNode,
        SetStateAction,
} from 'react'
import {
        FiPlus,
        FiTrash2,
        FiX,
        FiArrowUp,
        FiArrowDown,
} from 'react-icons/fi'
import type {
        Resource,
        ResourceSection,
} from '../../services/resourceService'
import type { TriviaChallenge } from '../../services/triviaService'

type StyleOption = {
        value: string
        color: string
        background: string
        label: string
        icon: ReactNode
}

type SectionStyleOption = {
        value: string
        color: string
        label: string
}

type ResourceFormProps = {
        isEditing: boolean
        editingResource: Resource | null
        handleAddResource: (event: FormEvent<HTMLFormElement>) => void
        handleCancelAdd: () => void
        saving: boolean
        title: string
        setTitle: Dispatch<SetStateAction<string>>
        description: string
        setDescription: Dispatch<SetStateAction<string>>
        content: string
        setContent: Dispatch<SetStateAction<string>>
        pdfUrl: string
        setPdfUrl: Dispatch<SetStateAction<string>>
        styleType: string
        showStyleDropdown: boolean
        setShowStyleDropdown: Dispatch<SetStateAction<boolean>>
        selectedStyle: StyleOption | undefined
        styleOptions: StyleOption[]
        sections: ResourceSection[]
        sectionStyleOptions: SectionStyleOption[]
        handleStyleSelect: (value: string) => void
        handleSectionChange: (
                index: number,
                field: keyof ResourceSection,
                value: string
        ) => void
        handleAddSection: () => void
        handleRemoveSection: (index: number) => void
        handleMoveSectionUp: (index: number) => void
        handleMoveSectionDown: (index: number) => void
        formError: boolean
}

type ChallengeFormProps = {
        editingTriviaChallenge: TriviaChallenge | null
        handleSaveChallenge: (event: FormEvent<HTMLFormElement>) => void
        handleCancelChallenge: () => void
        savingChallenge: boolean
        challengeTitle: string
        setChallengeTitle: Dispatch<SetStateAction<string>>
        challengeDescription: string
        setChallengeDescription: Dispatch<SetStateAction<string>>
        challengeActive: boolean
        setChallengeActive: Dispatch<SetStateAction<boolean>>
        challengeFormError: boolean
}

type TriviaFormProps = {
        isEditing: boolean
        handleSaveTrivia: (event: FormEvent<HTMLFormElement>) => void
        handleCancelTrivia: () => void
        savingTrivia: boolean
        triviaQuestion: string
        setTriviaQuestion: Dispatch<SetStateAction<string>>
        answerA: string
        setAnswerA: Dispatch<SetStateAction<string>>
        answerB: string
        setAnswerB: Dispatch<SetStateAction<string>>
        answerC: string
        setAnswerC: Dispatch<SetStateAction<string>>
        answerD: string
        setAnswerD: Dispatch<SetStateAction<string>>
        correctAnswer: string
        setCorrectAnswer: Dispatch<SetStateAction<string>>
        triviaFormError: boolean
}

export function ResourceForm(props: ResourceFormProps) {
        const {
                isEditing,
                editingResource,
                handleAddResource,
                handleCancelAdd,
                saving,
                title,
                setTitle,
                description,
                setDescription,
                content,
                setContent,
                pdfUrl,
                setPdfUrl,
                styleType,
                showStyleDropdown,
                setShowStyleDropdown,
                selectedStyle,
                styleOptions,
                sections,
                sectionStyleOptions,
                handleStyleSelect,
                handleSectionChange,
                handleAddSection,
                handleRemoveSection,
                handleMoveSectionUp,
                handleMoveSectionDown,
                formError,
        } = props

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
                                Title *
                                <input
                                        type="text"
                                        value={title}
                                        required
                                        onChange={(event) =>
                                                setTitle(event.target.value)
                                        }
                                />
                        </label>

                        <label>
                                Description *
                                <input
                                        type="text"
                                        value={description}
                                        required
                                        onChange={(event) =>
                                                setDescription(event.target.value)
                                        }
                                />
                        </label>

                        <label>
                                Content *
                                <textarea
                                        value={content}
                                        required
                                        onChange={(event) =>
                                                setContent(event.target.value)
                                        }
                                />
                        </label>

                        <label>
                                PDF URL
                                <input
                                        type="text"
                                        value={pdfUrl}
                                        onChange={(event) => setPdfUrl(event.target.value)}
                                        placeholder="Optional PDF link"
                                />
                                <small>
                                        Leave blank if this resource does not have a PDF.
                                </small>
                        </label>

                        <label>
                                Style Type *

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
                                                                Section Heading *
                                                                <input
                                                                        type="text"
                                                                        value={section.heading}
                                                                        required
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
                                                                Items *
                                                                <textarea
                                                                        value={section.items}
                                                                        required
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
                                        Please complete all required fields, including
                                        each resource section heading and at least one
                                        item.
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

export function ChallengeForm(props: ChallengeFormProps) {
        const {
                editingTriviaChallenge,
                handleSaveChallenge,
                handleCancelChallenge,
                savingChallenge,
                challengeTitle,
                setChallengeTitle,
                challengeDescription,
                setChallengeDescription,
                challengeActive,
                setChallengeActive,
                challengeFormError,
        } = props

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
                                Challenge Title *
                                <input
                                        type="text"
                                        value={challengeTitle}
                                        required
                                        onChange={(event) =>
                                                setChallengeTitle(event.target.value)
                                        }
                                        placeholder="Enter the challenge title"
                                />
                        </label>

                        <label>
                                Description *
                                <textarea
                                        value={challengeDescription}
                                        required
                                        onChange={(event) =>
                                                setChallengeDescription(
                                                        event.target.value
                                                )
                                        }
                                        placeholder="Describe what this challenge covers"
                                />
                        </label>

                        {isEditing && (
                                <div className="admin-resource-active-setting">
                                        <label className="admin-resource-active-toggle">
                                                <input
                                                        type="checkbox"
                                                        checked={challengeActive}
                                                        onChange={(event) =>
                                                                setChallengeActive(
                                                                        event.target.checked
                                                                )
                                                        }
                                                        disabled={savingChallenge}
                                                />

                                                <span>
                                                        <strong>
                                                                {challengeActive
                                                                        ? 'Active'
                                                                        : 'Inactive'}
                                                        </strong>

                                                        <small>
                                                                {challengeActive
                                                                        ? 'This challenge is visible on the public Resources page.'
                                                                        : 'This challenge is hidden from the public while you work on it.'}
                                                        </small>
                                                </span>
                                        </label>
                                </div>
                        )}

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

export function TriviaForm(props: TriviaFormProps) {
        const {
                isEditing,
                handleSaveTrivia,
                handleCancelTrivia,
                savingTrivia,
                triviaQuestion,
                setTriviaQuestion,
                answerA,
                setAnswerA,
                answerB,
                setAnswerB,
                answerC,
                setAnswerC,
                answerD,
                setAnswerD,
                correctAnswer,
                setCorrectAnswer,
                triviaFormError,
        } = props

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
                                Question *
                                <textarea
                                        value={triviaQuestion}
                                        required
                                        onChange={(event) =>
                                                setTriviaQuestion(event.target.value)
                                        }
                                        placeholder="Enter the trivia question"
                                />
                        </label>

                        <label>
                                Answer A *
                                <input
                                        type="text"
                                        value={answerA}
                                        required
                                        onChange={(event) =>
                                                setAnswerA(event.target.value)
                                        }
                                        placeholder="Enter answer A"
                                />
                        </label>

                        <label>
                                Answer B *
                                <input
                                        type="text"
                                        value={answerB}
                                        required
                                        onChange={(event) =>
                                                setAnswerB(event.target.value)
                                        }
                                        placeholder="Enter answer B"
                                />
                        </label>

                        <label>
                                Answer C *
                                <input
                                        type="text"
                                        value={answerC}
                                        required
                                        onChange={(event) =>
                                                setAnswerC(event.target.value)
                                        }
                                        placeholder="Enter answer C"
                                />
                        </label>

                        <label>
                                Answer D *
                                <input
                                        type="text"
                                        value={answerD}
                                        required
                                        onChange={(event) =>
                                                setAnswerD(event.target.value)
                                        }
                                        placeholder="Enter answer D"
                                />
                        </label>

                        <label>
                                Correct Answer *
                                <select
                                        value={correctAnswer}
                                        required
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