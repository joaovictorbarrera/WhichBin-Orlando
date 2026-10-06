import { useEffect, useState, type FormEvent } from 'react'
import {
  FiArrowLeft,
  FiBox,
  FiEdit,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/PageLayout'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import {
  createItem,
  deleteItem,
  fetchItems,
  updateItem,
  type Item,
  type ItemInput,
} from '../../services/itemService'
import './AdminSection.css'
import './AdminItems.css'

type FilterOption = 'all' | 'recyclable' | 'non-recyclable'

function AdminItems() {
  const [items, setItems] = useState<Item[]>([])
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [name, setName] = useState('')
  const [recyclable, setRecyclable] = useState(true)
  const [largeItem, setLargeItem] = useState(false)
  const [information, setInformation] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 250)

    return () => clearTimeout(timer)
  }, [searchText])

  useEffect(() => {
    let isMounted = true

    async function loadItems() {
      setLoading(true)
      setLoadError(false)

      const recyclableParam =
        filter === 'recyclable'
          ? true
          : filter === 'non-recyclable'
            ? false
            : undefined
      const result = await fetchItems(
        debouncedSearchText.trim(),
        recyclableParam
      )
      if (!isMounted) return

      if (result === null) {
        setItems([])
        setLoadError(true)
      } else {
        setItems(result)
      }

      setLoading(false)
    }

    void loadItems()
    return () => {
      isMounted = false
    }
  }, [debouncedSearchText, filter, refreshKey])

  function resetForm() {
    setName('')
    setRecyclable(true)
    setLargeItem(false)
    setInformation('')
    setKeywords([])
    setKeywordInput('')
    setEditingItem(null)
    setFormError('')
  }

  function handleAddItem() {
    resetForm()
    setShowForm(true)
  }

  function handleEditItem(item: Item) {
    setEditingItem(item)
    setName(item.name)
    setRecyclable(item.recyclable)
    setLargeItem(item.recyclable && item.largeItem)
    setInformation(item.information)
    setKeywords(item.keywords ?? [])
    setKeywordInput('')
    setFormError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelForm() {
    if (saving) return
    resetForm()
    setShowForm(false)
  }

  function handleAddKeyword() {
    const keyword = keywordInput.trim()
    if (!keyword) return

    if (keyword.length > 100) {
      setFormError('Each keyword must be 100 characters or fewer.')
      return
    }

    if (keywords.some((existing) => existing.toLowerCase() === keyword.toLowerCase())) {
      setFormError('This keyword has already been added.')
      return
    }

    if (keywords.length >= 20) {
      setFormError('An item can have no more than 20 keywords.')
      return
    }

    setKeywords((current) => [...current, keyword])
    setKeywordInput('')
    setFormError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim() || !information.trim()) {
      setFormError('Item name and disposal instructions are required.')
      return
    }

    const itemInput: ItemInput = {
      name: name.trim(),
      recyclable,
      largeItem: recyclable && largeItem,
      information: information.trim(),
      keywords,
    }

    setSaving(true)
    setFormError('')

    const result = editingItem
      ? await updateItem(editingItem.id, itemInput)
      : await createItem(itemInput)

    if (result === null) {
      setFormError(
        editingItem
          ? 'The item could not be updated. Please try again.'
          : 'The item could not be created. Please try again.'
      )
      setSaving(false)
      return
    }

    setRefreshKey((current) => current + 1)
    setSaving(false)
    resetForm()
    setShowForm(false)
  }

  function handleCloseDeleteModal() {
    if (!deleting) setDeleteTarget(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || deleting) return

    setDeleting(true)
    const success = await deleteItem(deleteTarget.id)

    if (!success) {
      setDeleting(false)
      setDeleteTarget(null)
      window.alert('The item could not be deleted. Please try again.')
      return
    }

    setItems((current) => current.filter((item) => item.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <PageLayout
      className="admin-section-page admin-section-items"
      width="wide"
    >
      <Link to="/admin" className="admin-section-back">
        <FiArrowLeft aria-hidden="true" />
        Back to dashboard
      </Link>

      <section className="admin-items-header">
        <div className="admin-items-heading">
          <span className="admin-section-icon">
            <FiBox aria-hidden="true" />
          </span>
          <div>
            <p className="admin-section-eyebrow">Admin workspace</p>
            <h1>Manage Items</h1>
            <p>Maintain searchable household items and disposal classifications.</p>
          </div>
        </div>
        {!showForm && (
          <button
            type="button"
            className="admin-items-add"
            onClick={handleAddItem}
          >
            <FiPlus aria-hidden="true" />
            Add Item
          </button>
        )}
      </section>

      {showForm && (
        <section className="admin-items-form-panel" aria-labelledby="item-form-heading">
          <div className="admin-items-form-header">
            <div>
              <p className="admin-items-form-eyebrow">
                {editingItem ? 'Edit item' : 'New item'}
              </p>
              <h2 id="item-form-heading">
                {editingItem ? 'Update Item' : 'Add an Item'}
              </h2>
            </div>
            <button
              type="button"
              className="admin-items-close"
              onClick={handleCancelForm}
              disabled={saving}
              aria-label="Close item form"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>

          <form className="admin-items-form" onSubmit={handleSubmit}>
            <label>
              Item name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={150}
                required
              />
            </label>

            <div className="admin-items-classification">
              <label className="admin-items-checkbox">
                <input
                  type="checkbox"
                  checked={recyclable}
                  onChange={(event) => {
                    const isRecyclable = event.target.checked
                    setRecyclable(isRecyclable)
                    if (!isRecyclable) setLargeItem(false)
                  }}
                />
                <span>
                  <strong>Recyclable</strong>
                  <small>Accepted in Orlando&apos;s residential recycling program.</small>
                </span>
              </label>

              <label className="admin-items-checkbox">
                <input
                  type="checkbox"
                  checked={largeItem}
                  disabled={!recyclable}
                  onChange={(event) => setLargeItem(event.target.checked)}
                />
                <span>
                  <strong>Large item pickup</strong>
                  <small>
                    Show the City of Orlando large item collection guidance for this item.
                  </small>
                </span>
              </label>
            </div>

            <label>
              Disposal instructions
              <textarea
                value={information}
                onChange={(event) => setInformation(event.target.value)}
                maxLength={5000}
                rows={5}
                required
              />
            </label>

            <section className="admin-items-keywords" aria-labelledby="item-keywords-heading">
              <div className="admin-items-keywords-heading">
                <div>
                  <h3 id="item-keywords-heading">Keywords</h3>
                  <p>Search terms people might use to find this item.</p>
                </div>
                <span>{keywords.length}/20</span>
              </div>

              <div className="admin-items-keyword-entry">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleAddKeyword()
                    }
                  }}
                  maxLength={100}
                  placeholder="Enter a keyword"
                  aria-label="Item keyword"
                  disabled={keywords.length >= 20}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  disabled={!keywordInput.trim() || keywords.length >= 20}
                >
                  <FiPlus aria-hidden="true" />
                  Add keyword
                </button>
              </div>

              {keywords.length > 0 ? (
                <ul className="admin-items-keyword-list" aria-label="Item keywords">
                  {keywords.map((keyword, index) => (
                    <li className="admin-items-keyword-chip" key={`${keyword}-${index}`}>
                      <span>{keyword}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setKeywords((current) =>
                            current.filter((_, keywordIndex) => keywordIndex !== index)
                          )
                          setFormError('')
                        }}
                        aria-label={`Remove keyword ${keyword}`}
                      >
                        <FiX aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin-items-keywords-empty">No keywords added yet.</p>
              )}
            </section>

            {formError && (
              <p className="admin-items-form-error" role="alert">{formError}</p>
            )}

            <div className="admin-items-form-actions">
              <button
                type="button"
                className="admin-items-cancel"
                onClick={handleCancelForm}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-items-save"
                disabled={saving}
              >
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-items-list-section" aria-labelledby="items-list-heading">
        <section className="admin-items-controls" aria-label="Search and filter items">
          <form
            className="admin-items-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <FiSearch className="admin-items-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search items (e.g., plastic bottle, cardboard, battery)..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="Search items"
            />
            {searchText && (
              <button
                type="button"
                className="admin-items-search-clear"
                onClick={() => setSearchText('')}
                aria-label="Clear search text"
              >
                <FiX aria-hidden="true" />
              </button>
            )}
          </form>

          <div
            className="admin-items-filters"
            role="group"
            aria-label="Filter items by recyclability"
          >
            <button
              type="button"
              className={`admin-items-filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
            >
              All Items
            </button>
            <button
              type="button"
              className={`admin-items-filter ${filter === 'recyclable' ? 'active' : ''}`}
              onClick={() => setFilter('recyclable')}
              aria-pressed={filter === 'recyclable'}
            >
              <FaRecycle aria-hidden="true" />
              Recyclable
            </button>
            <button
              type="button"
              className={`admin-items-filter ${filter === 'non-recyclable' ? 'active' : ''}`}
              onClick={() => setFilter('non-recyclable')}
              aria-pressed={filter === 'non-recyclable'}
            >
              <FiTrash2 aria-hidden="true" />
              Non-Recyclable
            </button>
          </div>
        </section>

        <div className="admin-items-list-heading">
          <div>
            <h2 id="items-list-heading">Items</h2>
            <p>Items shown in public search and detail pages.</p>
          </div>
          {!loading && !loadError && (
            <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          )}
        </div>

        {loading && <p className="admin-items-status" role="status">Loading items...</p>}

        {!loading && loadError && (
          <div className="admin-items-empty admin-items-error" role="alert">
            <p>Items could not be loaded. Check your connection and try again.</p>
            <button type="button" onClick={() => setRefreshKey((current) => current + 1)}>
              <FiRefreshCw aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && items.length === 0 && (
          <div className="admin-items-empty">
            <p>
              {debouncedSearchText.trim()
                ? `No items matched "${debouncedSearchText.trim()}". Try another search or adjust the filter.`
                : filter !== 'all'
                  ? 'There are no items matching the selected filter.'
                  : 'No items yet. Add an item to get started.'}
            </p>
            {(searchText.trim() || filter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchText('')
                  setFilter('all')
                }}
              >
                Clear search &amp; filters
              </button>
            )}
          </div>
        )}

        {!loading && !loadError && items.length > 0 && (
          <div className="admin-items-list">
            {[...items].sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
              <article className="admin-item-card" key={item.id}>
                <div className="admin-item-card-content">
                  <div className="admin-item-card-labels">
                    <span className={item.recyclable ? 'admin-item-badge-recyclable' : 'admin-item-badge-trash'}>
                      {item.recyclable ? <FaRecycle aria-hidden="true" /> : <FiTrash2 aria-hidden="true" />}
                      {item.recyclable ? 'Recyclable' : 'Non-Recyclable'}
                    </span>
                    {item.recyclable && item.largeItem && (
                      <span className="admin-item-badge-large">Large item pickup</span>
                    )}
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.information}</p>
                  {!!item.keywords?.length && (
                    <ul className="admin-item-keyword-list" aria-label={`${item.name} keywords`}>
                      {item.keywords.map((keyword) => (
                        <li key={keyword}>{keyword}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="admin-item-card-actions">
                  <button
                    type="button"
                    onClick={() => handleEditItem(item)}
                    disabled={saving || deleting}
                    aria-label={`Edit ${item.name}`}
                  >
                    <FiEdit aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-item-delete"
                    onClick={() => setDeleteTarget(item)}
                    disabled={saving || deleting}
                    aria-label={`Delete ${item.name}`}
                  >
                    <FiTrash2 aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Item?"
          itemName={deleteTarget.name}
          description="This item will be permanently removed from the public item search."
          confirmLabel="Delete Item"
          loading={deleting}
          onCancel={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </PageLayout>
  )
}

export default AdminItems
