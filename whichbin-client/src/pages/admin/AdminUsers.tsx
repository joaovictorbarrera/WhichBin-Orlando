import { useEffect, useState, type FormEvent } from 'react'
import {
  FiArrowLeft,
  FiCopy,
  FiEdit,
  FiKey,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import { useAuth } from '../../context/useAuth'
import {
  createPasswordResetLink,
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type ManagedUser,
  type UserInput,
} from '../../services/userService'
import './AdminSection.css'
import './AdminUsers.css'

type ShareLink = {
  userId: number
  email: string
  url: string
}

const emptyUserInput: UserInput = {
  firstName: '',
  lastName: '',
  email: '',
}

function createRegistrationLink(invitationToken: string, email: string) {
  const query = `invitationToken=${encodeURIComponent(invitationToken)}&userEmail=${encodeURIComponent(email)}`
  return `${window.location.origin}/admin/register?${query}`
}

function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [pageError, setPageError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createInput, setCreateInput] = useState<UserInput>(emptyUserInput)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editInput, setEditInput] = useState<UserInput>(emptyUserInput)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [resettingUserId, setResettingUserId] = useState<number | null>(null)
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      setIsLoading(true)
      setLoadError('')
      try {
        const loadedUsers = await fetchUsers()
        if (isMounted) setUsers(loadedUsers)
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load users.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadUsers()
    return () => {
      isMounted = false
    }
  }, [reloadCount])

  function beginCreate() {
    setCreateInput(emptyUserInput)
    setPageError('')
    setShareLink(null)
    setIsCreating(true)
    setEditingUserId(null)
  }

  function beginEdit(managedUser: ManagedUser) {
    setPageError('')
    setShareLink(null)
    setIsCreating(false)
    setEditingUserId(managedUser.id)
    setEditInput({
      firstName: managedUser.firstName,
      lastName: managedUser.lastName,
      email: managedUser.email,
    })
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPageError('')
    setIsSaving(true)

    try {
      const createdUser = await createUser({
        firstName: createInput.firstName.trim(),
        lastName: createInput.lastName.trim(),
        email: createInput.email.trim(),
      })
      setUsers((currentUsers) => [...currentUsers, createdUser])
      setShareLink({
        userId: createdUser.id,
        email: createdUser.email,
        url: createRegistrationLink(createdUser.invitationToken, createdUser.email),
      })
      setCopied(false)
      setIsCreating(false)
      setCreateInput(emptyUserInput)
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to create this user.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editingUserId === null) return

    setPageError('')
    setIsSaving(true)
    try {
      const updatedUser = await updateUser(editingUserId, {
        firstName: editInput.firstName.trim(),
        lastName: editInput.lastName.trim(),
        email: editInput.email.trim(),
      })
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser
        )
      )
      setEditingUserId(null)
      setEditInput(emptyUserInput)
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to update this user.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setPageError('')
    setIsDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== deleteTarget.id)
      )
      setShareLink((currentLink) =>
        currentLink?.userId === deleteTarget.id ? null : currentLink
      )
      setDeleteTarget(null)
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to delete this user.')
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleResetPassword(managedUser: ManagedUser) {
    setPageError('')
    setShareLink(null)
    setResettingUserId(managedUser.id)
    try {
      const invitationToken = await createPasswordResetLink(managedUser.id)
      setShareLink({
        userId: managedUser.id,
        email: managedUser.email,
        url: createRegistrationLink(invitationToken, managedUser.email),
      })
      setCopied(false)
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Unable to generate a password reset link.'
      )
    } finally {
      setResettingUserId(null)
    }
  }

  async function handleCopyLink() {
    if (!shareLink) return
    setPageError('')
    try {
      await navigator.clipboard.writeText(shareLink.url)
      setCopied(true)
    } catch {
      setCopied(false)
      setPageError('The link could not be copied. Copy it directly from the link field.')
    }
  }

  const signedInName = user?.firstName ?? 'Admin'

  return (
    <PageLayout className="admin-section-page admin-users-page" width="wide">
      <Link to="/admin" className="admin-section-back">
        <FiArrowLeft />
        Back to dashboard
      </Link>

      <section className="admin-users-panel" aria-labelledby="admin-users-title">
        <header className="admin-users-header">
          <span className="admin-section-icon"><FiUsers /></span>
          <div>
            <p className="admin-section-eyebrow">Admin workspace</p>
            <h1 id="admin-users-title">Manage Users</h1>
            <p>Invite users, update account details, and share password setup links.</p>
          </div>
          <button
            type="button"
            className="admin-users-primary"
            onClick={beginCreate}
            disabled={isCreating || isSaving}
          >
            <FiPlus aria-hidden="true" />
            Create User
          </button>
        </header>

        <p className="admin-users-signed-in">Signed in as {signedInName}.</p>

        {pageError && <p className="admin-users-error" role="alert">{pageError}</p>}
        {loadError && (
          <div className="admin-users-load-error" role="alert">
            <p>{loadError}</p>
            <button type="button" onClick={() => setReloadCount((count) => count + 1)}>
              Try again
            </button>
          </div>
        )}

        {isCreating && (
          <UserForm
            title="Create user"
            input={createInput}
            onChange={setCreateInput}
            onSubmit={handleCreate}
            onCancel={() => {
              if (!isSaving) {
                setIsCreating(false)
                setCreateInput(emptyUserInput)
                setPageError('')
              }
            }}
            submitLabel={isSaving ? 'Creating...' : 'Create'}
            disabled={isSaving}
          />
        )}

        {shareLink && (
          <section className="admin-users-share" aria-live="polite">
            <div>
              <h2>Registration link ready</h2>
              <p>Share this single-use link with {shareLink.email}.</p>
            </div>
            <div className="admin-users-share-controls">
              <input aria-label="Registration link" readOnly value={shareLink.url} />
              <button type="button" onClick={handleCopyLink}>
                <FiCopy aria-hidden="true" />
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </section>
        )}

        <div className="admin-users-list-heading">
          <h2>Users</h2>
          <span>{users.length} {users.length === 1 ? 'account' : 'accounts'}</span>
        </div>

        {isLoading ? (
          <p className="admin-users-status" role="status">Loading users...</p>
        ) : users.length === 0 && !loadError ? (
          <p className="admin-users-status">No users have been created yet.</p>
        ) : (
          <div className="admin-users-list">
            {users.map((managedUser) => (
              <article className="admin-user-card" key={managedUser.id}>
                <div className="admin-user-summary">
                  <div className="admin-user-identity">
                    <span className="admin-user-avatar" aria-hidden="true">
                      {managedUser.firstName.charAt(0)}{managedUser.lastName.charAt(0)}
                    </span>
                    <div>
                      <h3>{managedUser.firstName} {managedUser.lastName}</h3>
                      <p>{managedUser.email}</p>
                    </div>
                  </div>
                  <div className="admin-user-actions">
                    <button
                      type="button"
                      onClick={() => beginEdit(managedUser)}
                      disabled={isSaving || isCreating}
                    >
                      <FiEdit aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPageError('')
                        setDeleteTarget(managedUser)
                      }}
                      disabled={isDeleting || isSaving}
                    >
                      <FiTrash2 aria-hidden="true" />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleResetPassword(managedUser)}
                      disabled={resettingUserId !== null}
                    >
                      <FiKey aria-hidden="true" />
                      {resettingUserId === managedUser.id ? 'Generating...' : 'Reset Password'}
                    </button>
                  </div>
                </div>

                {editingUserId === managedUser.id && (
                  <UserForm
                    title={`Edit ${managedUser.firstName} ${managedUser.lastName}`}
                    input={editInput}
                    onChange={setEditInput}
                    onSubmit={handleSave}
                    onCancel={() => {
                      if (!isSaving) {
                        setEditingUserId(null)
                        setEditInput(emptyUserInput)
                        setPageError('')
                      }
                    }}
                    submitLabel={isSaving ? 'Saving...' : 'Save'}
                    disabled={isSaving}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete user?"
          itemName={`${deleteTarget.firstName} ${deleteTarget.lastName} (${deleteTarget.email})`}
          description="This account and its active sessions will be permanently removed."
          confirmLabel="Delete user"
          loading={isDeleting}
          onCancel={() => {
            if (!isDeleting) setDeleteTarget(null)
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </PageLayout>
  )
}

function UserForm({
  title,
  input,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  title: string
  input: UserInput
  onChange: (input: UserInput) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  submitLabel: string
  disabled: boolean
}) {
  function setField(field: keyof UserInput, value: string) {
    onChange({ ...input, [field]: value })
  }

  return (
    <form className="admin-user-form" onSubmit={onSubmit}>
      <div className="admin-user-form-heading">
        <h2>{title}</h2>
        <button type="button" onClick={onCancel} disabled={disabled} aria-label="Cancel">
          <FiX aria-hidden="true" />
        </button>
      </div>
      <div className="admin-user-form-fields">
        <label>
          First Name
          <input
            name="firstName"
            type="text"
            autoComplete="given-name"
            maxLength={100}
            required
            value={input.firstName}
            onChange={(event) => setField('firstName', event.target.value)}
          />
        </label>
        <label>
          Last Name
          <input
            name="lastName"
            type="text"
            autoComplete="family-name"
            maxLength={100}
            required
            value={input.lastName}
            onChange={(event) => setField('lastName', event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            required
            value={input.email}
            onChange={(event) => setField('email', event.target.value)}
          />
        </label>
      </div>
      <div className="admin-user-form-actions">
        <button type="button" className="admin-users-secondary" onClick={onCancel} disabled={disabled}>
          Cancel
        </button>
        <button type="submit" className="admin-users-primary" disabled={disabled}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default AdminUsers
