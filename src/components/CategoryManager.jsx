import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { Sheet, InsetGroup, NavButton } from './Layout'

export function CategoryManager({ onClose }) {
  const { categories, loading, addCategory, deleteCategory } = useCategories()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await addCategory(name.trim())
      setName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Equipment in this category will become uncategorized.')) return
    try { await deleteCategory(id) } catch (err) { setError(err.message) }
  }

  return (
    <Sheet onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="w-12" />
        <span className="text-[17px] font-semibold text-black">Categories</span>
        <NavButton onClick={onClose}>Done</NavButton>
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-2">
        {/* Add new */}
        <InsetGroup label="New Category">
          <div className="flex items-center px-4 py-3 gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Category name"
              className="flex-1 text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={saving || !name.trim()}
              className="text-[#007AFF] text-[17px] disabled:opacity-40 active:opacity-50"
            >
              Add
            </button>
          </div>
        </InsetGroup>

        {error && <p className="text-[#FF3B30] text-[13px] px-4 mb-4">{error}</p>}

        {/* List */}
        {loading && (
          <div className="text-center py-8 text-[#8E8E93] text-[15px]">Loading…</div>
        )}

        {!loading && categories.length > 0 && (
          <InsetGroup label="Categories">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-[17px] text-black">{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-[#FF3B30] text-[15px] active:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </InsetGroup>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center py-6 text-[#8E8E93] text-[15px]">
            No categories yet
          </div>
        )}

        <div className="h-4" />
      </div>
    </Sheet>
  )
}
