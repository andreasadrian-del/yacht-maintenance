import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { Sheet, InsetGroup, PrimaryButton, NavButton } from './Layout'

export function EquipmentForm({ initial, onSave, onClose, onDelete }) {
  const { categories } = useCategories()
  const [name, setName] = useState(initial?.name ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '')
  const [nextDate, setNextDate] = useState(initial?.next_maintenance_date ?? '')
  const [quantity, setQuantity] = useState(initial?.quantity ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        category_id: categoryId || null,
        next_maintenance_date: nextDate || null,
        quantity: quantity !== '' ? parseInt(quantity, 10) : null,
      })
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Sheet onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <NavButton onClick={onClose}>Cancel</NavButton>
        <span className="text-[17px] font-semibold text-black">
          {initial ? 'Edit Equipment' : 'New Equipment'}
        </span>
        <NavButton onClick={handleSubmit} disabled={saving || !name.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </NavButton>
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-2">
        {/* Name */}
        <InsetGroup>
          <div className="px-4 py-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Equipment Name"
              autoFocus
              className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
            />
          </div>
        </InsetGroup>

        {/* Category */}
        <InsetGroup label="Category">
          <div className="px-4 py-3">
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full text-[17px] text-black focus:outline-none bg-transparent appearance-none"
            >
              <option value="">None</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </InsetGroup>

        {/* Quantity */}
        <InsetGroup label="Quantity on Board">
          <div className="px-4 py-3">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="e.g. 2"
              className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
            />
          </div>
        </InsetGroup>

        {/* Next maintenance */}
        <InsetGroup label="Next Maintenance">
          <div className="px-4 py-3">
            <input
              type="date"
              value={nextDate}
              onChange={e => setNextDate(e.target.value)}
              className="w-full text-[17px] text-black focus:outline-none bg-transparent"
            />
          </div>
        </InsetGroup>

        {error && (
          <p className="text-[#FF3B30] text-[13px] px-4 mb-4">{error}</p>
        )}

        {/* Delete (edit mode only) */}
        {initial && onDelete && (
          <InsetGroup>
            <button
              onClick={onDelete}
              className="w-full px-4 py-3 text-[17px] text-[#FF3B30] text-center active:opacity-50"
            >
              Delete Equipment
            </button>
          </InsetGroup>
        )}

        <div className="h-4" />
      </div>
    </Sheet>
  )
}
