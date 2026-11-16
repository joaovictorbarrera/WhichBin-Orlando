import CollectionState from '../../components/CollectionState'
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
import { Link, useNavigate } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import { useAuth } from '../../context/useAuth'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import Pagination from '../../components/Pagination/Pagination'
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

function createRegistrationPath(invitationToken: string, email: string) {
  const query = `invitationToken=${encodeURIComponent(invitationToken)}&userEmail=${encodeURIComponent(email)}`
  return `/admin/register?${query}`
}

function createRegistrationLink(invitationToken: string, email: string) {
  return `${window.location.origin}${createRegistrationPath(invitationToken, email)}`
}

function AdminUsers() {
  const { user: currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalItems, setTotalItems] = useState<number>()
  const [hasLoaded, setHasLoaded] = useState(false)
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
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null)
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [copied, setCopied] = useState(false)
  const isUpdating = isLoading && hasLoaded

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      setIsLoading(true)
      setLoadError('')
      try {
        const result = await fetchUsers(currentPage, pageSize, controller.signal)
        if (isMounted) {
          setUsers(result.items)
          setTotalItems(result.totalItems)
          setHasLoaded(true)
        }
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load users.')
        }
      } finally {
        if (isMounted && !controller.signal.aborted) setIsLoading(false)
      }
    }

    const controller = new AbortController()
    void loadUsers()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [currentPage, pageSize, reloadCount])

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize)
    setCurrentPage(1)
  }

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
      setShareLink({
        userId: createdUser.id,
        email: createdUser.email,
        url: createRegistrationLink(createdUser.invitationToken, createdUser.email),
      })
      setCopied(false)
      setIsCreating(false)
      setCreateInput(emptyUserInput)
      setCurrentPage(1)
      setReloadCount((count) => count + 1)
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
      await updateUser(editingUserId, {
        firstName: editInput.firstName.trim(),
        lastName: editInput.lastName.trim(),
        email: editInput.email.trim(),
      })
      setEditingUserId(null)
      setEditInput(emptyUserInput)
      setReloadCount((count) => count + 1)
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
      if (deleteTarget.id === currentUser?.id) {
        try {
          await logout()
        } catch {
          // The account has already been deleted, so the logout request may fail.
        }

        navigate('/admin/login', { replace: true })
        return
      }
      setShareLink((currentLink) =>
        currentLink?.userId === deleteTarget.id ? null : currentLink
      )
      setDeleteTarget(null)
      const totalAfterDelete = Math.max(0, (totalItems ?? users.length) - 1)
      const lastPage = Math.max(1, Math.ceil(totalAfterDelete / pageSize))
      if (currentPage > lastPage) {
        setCurrentPage(lastPage)
      }
      setReloadCount((count) => count + 1)
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
      if (managedUser.id === currentUser?.id) {
        navigate(createRegistrationPath(invitationToken, managedUser.email), { replace: true })

        try {
          await logout()
        } catch {
          // Backend may have already invalidated the session.
        }

        return
      }
      setShareLink({
        userId: managedUser.id,
        email: managedUser.email,
        url: createRegistrationLink(invitationToken, managedUser.email),
      })
      setCopied(false)
      setResetTarget(null)
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Unable to generate a password reset link.'
      )
      setResetTarget(null)
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

        {pageError && <p className="admin-users-error" role="alert">{pageError}</p>}
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
          {hasLoaded && !loadError && totalItems !== undefined && (
            <span>{totalItems} {totalItems === 1 ? 'account' : 'accounts'}</span>
          )}
        </div>

        {isLoading && !hasLoaded ? (
          <CollectionState state="loading" name="users" />
        ) : !isLoading && loadError ? (
          <CollectionState state="error" name="users" onRetry={() => setReloadCount((count) => count + 1)} />
        ) : hasLoaded && !loadError && users.length === 0 ? (
          <CollectionState state="empty" name="users" description="No users have been created yet." />
        ) : hasLoaded && !loadError && users.length > 0 ? (
          <div className="admin-users-list collection-list" aria-busy={isLoading}>
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
                      onClick={() => {
                        if (managedUser.id === currentUser?.id) {
                          setResetTarget(managedUser)
                        } else {
                          void handleResetPassword(managedUser)
                        }
                      }}
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
        ) : null}
        {hasLoaded && (
          <div
            className={`admin-section-loading-indicator${isUpdating ? '' : ' is-hidden'}`}
            role={isUpdating ? 'status' : undefined}
            aria-hidden={!isUpdating}
          >
            {isUpdating && (
              <>
                <span className="admin-section-loading-spinner" aria-hidden="true" />
                Updating users...
              </>
            )}
          </div>
        )}
        {totalItems !== undefined && !loadError && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20]}
            displayName="users"
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </section>

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.id === currentUser?.id ? "Delete your own account?" : "Delete user?"}
          itemName={`${deleteTarget.firstName} ${deleteTarget.lastName} (${deleteTarget.email})`}
          description={
            deleteTarget.id === currentUser?.id
              ? "Warning: You are about to permanently delete your own account. You will be logged out immediately and will no longer be able to sign in with this account."
              : "This account and its active sessions will be permanently removed."
          }
          confirmLabel="Delete user"
          loading={isDeleting}
          onCancel={() => {
            if (!isDeleting) setDeleteTarget(null)
          }}
          onConfirm={() => void handleDelete()}
        />
      )}

      {resetTarget && resetTarget.id === currentUser?.id && (
        <DeleteConfirmModal
          title="Reset your password?"
          itemName={resetTarget.email}
          description="Warning: resetting your password will invalidate your current session and log you out. You will be redirected directly to the password reset page to choose a new password."
          confirmLabel="Reset password"
          confirmIcon={<FiKey aria-hidden="true" />}
          loading={resettingUserId === resetTarget.id}
          onCancel={() => {
            if (resettingUserId === null) setResetTarget(null)
          }}
          onConfirm={() => void handleResetPassword(resetTarget)}
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
