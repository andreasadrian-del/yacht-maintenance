import { useState } from 'react'
import {
  DndContext, DragOverlay, useDroppable, useDraggable,
  MouseSensor, TouchSensor, useSensor, useSensors, pointerWithin
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useEquipment } from '../hooks/useEquipment'
import { useCategories } from '../hooks/useCategories'
import { EquipmentForm } from './EquipmentForm'
import { MaintenanceHistory } from './MaintenanceHistory'
import { InsetGroup } from './Layout'

const TODAY = new Date(new Date().toDateString())

function statusFor(dateStr) {
  if (!dateStr) return { color: '#C7C7CC', label: null }
  const d = new Date(dateStr + 'T00:00:00')
  const diff = (d - TODAY) / 86400000
  if (diff < 0) return { color: '#FF3B30', label: 'Overdue' }
  if (diff <= 30) return { color: '#FF9500', label: 'Due soon' }
  return { color: '#34C759', label: null }
}

function formatDate(dateStr) {
  if (!dateStr) return 'No date set'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function Chevron() {
  return (
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" className="shrink-0 ml-2">
      <path d="M1 1l6 5.5L1 12" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// A single row — used both in the list and as the drag overlay ghost
function RowContent({ item, editMode, selected }) {
  const { color, label } = statusFor(item.next_maintenance_date)
  return (
    <div className="flex items-center gap-3 px-4 py-3 w-full">
      {editMode && (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          selected ? 'bg-[#007AFF] border-[#007AFF]' : 'border-[#C7C7CC]'
        }`}>
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      )}
      {!editMode && (
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-[17px] text-black truncate">{item.name}</p>
          {item.quantity != null && (
            <span className="text-[13px] text-[#8E8E93] shrink-0">×{item.quantity}</span>
          )}
        </div>
        <p className="text-[13px] mt-0.5" style={{ color: label ? color : '#8E8E93' }}>
          {label ? `${label} · ` : ''}{formatDate(item.next_maintenance_date)}
        </p>
      </div>
      {!editMode && <Chevron />}
    </div>
  )
}

// Draggable row
function DraggableRow({ item, editMode, selected, onToggleSelect, onHistory, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: editMode ? 'default' : 'grab',
  }

  const handleClick = () => {
    if (editMode) { onToggleSelect(item.id); return }
    onHistory(item)
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        onClick={handleClick}
        className="w-full text-left active:bg-black/[0.04] transition-colors"
        {...(!editMode ? { ...listeners, ...attributes } : {})}
      >
        <RowContent item={item} editMode={editMode} selected={selected} />
      </button>
      {!editMode && (
        <button
          onClick={() => onEdit(item)}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-[#007AFF] text-[15px] px-2 active:opacity-50"
        >
          Edit
        </button>
      )}
    </div>
  )
}

// Droppable category section
function DroppableSection({ id, label, children, isOver }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="mb-6">
      {label && (
        <p className="text-[13px] font-medium text-[#6C6C70] uppercase tracking-wide px-4 mb-2">{label}</p>
      )}
      <div className={`bg-white rounded-[12px] overflow-hidden divide-y divide-black/[0.08] transition-colors ${
        isOver ? 'bg-blue-50 ring-2 ring-[#007AFF]/30' : ''
      }`}>
        {children}
        {/* Empty drop zone placeholder */}
        {!children?.length && (
          <div className="px-4 py-4 text-[15px] text-[#C7C7CC] text-center">
            Drop items here
          </div>
        )}
      </div>
    </div>
  )
}

export function EquipmentList({ showAdd, onAddClose, editMode, onEditDone }) {
  const { equipment, loading, error, addEquipment, updateEquipment, deleteEquipment } = useEquipment()
  const { categories } = useCategories()
  const [editing, setEditing] = useState(null)
  const [historyFor, setHistoryFor] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } })
  )

  const filtered = search
    ? equipment.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.categories?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : equipment

  // Build sections: all categories (even empty) + uncategorized if needed
  const equipmentByCategory = filtered.reduce((acc, item) => {
    const key = item.category_id ?? '__none__'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const sections = [
    ...categories.map(cat => ({
      id: cat.id,
      label: cat.name,
      items: equipmentByCategory[cat.id] ?? [],
    })),
    ...(equipmentByCategory['__none__']?.length ? [{
      id: '__none__',
      label: 'Uncategorized',
      items: equipmentByCategory['__none__'],
    }] : []),
  ]

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selected.size} item${selected.size > 1 ? 's' : ''}? This will also remove their maintenance history.`)) return
    for (const id of selected) {
      await deleteEquipment(id)
    }
    setSelected(new Set())
    onEditDone()
  }

  const handleDragStart = ({ active }) => setActiveId(active.id)
  const handleDragOver = ({ over }) => setOverId(over?.id ?? null)

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null)
    setOverId(null)
    if (!over) return
    const item = equipment.find(e => e.id === active.id)
    const newCategoryId = over.id === '__none__' ? null : over.id
    if (item && item.category_id !== newCategoryId) {
      await updateEquipment(item.id, { category_id: newCategoryId })
    }
  }

  const activeItem = equipment.find(e => e.id === activeId)

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"? This will also delete its maintenance history.`)) return
    try { await deleteEquipment(item.id) } catch (err) { alert(err.message) }
  }

  if (error) return (
    <div className="bg-white rounded-[12px] px-4 py-4 text-[#FF3B30] text-[15px]">Error: {error}</div>
  )

  return (
    <>
      {/* Search bar — hidden in edit mode */}
      {!editMode && (
        <div className="mb-4">
          <div className="bg-[#767680]/[0.12] rounded-[10px] flex items-center gap-2 px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#8E8E93">
              <path fillRule="evenodd" d="M6.5 1a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM0 6.5a6.5 6.5 0 1111.65 4.007l3.422 3.421a.75.75 0 11-1.06 1.061l-3.422-3.42A6.5 6.5 0 010 6.5z"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 text-[17px] bg-transparent focus:outline-none text-black placeholder-[#8E8E93]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#8E8E93]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm2.78-4.22a.75.75 0 01-1.06 1.06L8 9.06l-1.72 1.72a.75.75 0 01-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 011.06-1.06L8 6.94l1.72-1.72a.75.75 0 111.06 1.06L9.06 8l1.72 1.72z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <div className="text-center py-16 text-[#8E8E93] text-[15px]">Loading…</div>}

      {!loading && equipment.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[17px] font-semibold text-black mb-1">No Equipment Yet</p>
          <p className="text-[15px] text-[#8E8E93]">Tap + to add your first piece of equipment.</p>
        </div>
      )}

      {!loading && equipment.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-[#8E8E93] text-[15px]">No results for "{search}"</div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {sections.map(section => (
          <DroppableSection
            key={section.id}
            id={section.id}
            label={section.label}
            isOver={overId === section.id}
          >
            {section.items.map(item => (
              <DraggableRow
                key={item.id}
                item={item}
                editMode={editMode}
                selected={selected.has(item.id)}
                onToggleSelect={toggleSelect}
                onHistory={setHistoryFor}
                onEdit={setEditing}
              />
            ))}
          </DroppableSection>
        ))}

        {/* Ghost item that follows the cursor/finger while dragging */}
        <DragOverlay>
          {activeItem && (
            <div className="bg-white rounded-[12px] shadow-2xl opacity-95 w-full">
              <RowContent item={activeItem} editMode={false} selected={false} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Delete bar — shown in edit mode when items are selected */}
      {editMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/[0.08] px-4 py-4 flex gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => { setSelected(new Set()); onEditDone() }}
            className="flex-1 bg-[#F2F2F7] text-black rounded-[12px] py-3 text-[17px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selected.size === 0}
            className="flex-1 bg-[#FF3B30] text-white rounded-[12px] py-3 text-[17px] font-semibold disabled:opacity-30"
          >
            {selected.size > 0 ? `Delete (${selected.size})` : 'Delete'}
          </button>
        </div>
      )}

      {editMode && <div className="h-24" />}

      {showAdd && (
        <EquipmentForm onSave={addEquipment} onClose={onAddClose} />
      )}

      {editing && (
        <EquipmentForm
          initial={editing}
          onSave={(data) => updateEquipment(editing.id, data)}
          onClose={() => setEditing(null)}
          onDelete={() => { handleDelete(editing); setEditing(null) }}
        />
      )}

      {historyFor && (
        <MaintenanceHistory equipment={historyFor} onClose={() => setHistoryFor(null)} />
      )}
    </>
  )
}
