import { useState } from 'react'
import { useMaintenanceHistory } from '../hooks/useMaintenanceHistory'
import { Sheet, InsetGroup, NavButton } from './Layout'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function MaintenanceHistory({ equipment, onClose }) {
  const { history, loading, addEntry, deleteEntry } = useMaintenanceHistory(equipment.id)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleAdd = async () => {
    if (!date) return
    setSaving(true)
    setError(null)
    try {
      await addEntry({ date, comments: comments.trim() })
      setComments('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this maintenance record?')) return
    try { await deleteEntry(id) } catch (err) { setError(err.message) }
  }

  return (
    <Sheet onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <NavButton onClick={onClose}>Done</NavButton>
        <div className="text-center">
          <p className="text-[17px] font-semibold text-black">{equipment.name}</p>
          <p className="text-[12px] text-[#8E8E93]">Maintenance History</p>
        </div>
        <div className="w-12" />
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-2">
        {/* Log new entry */}
        <InsetGroup label="Log Maintenance">
          <div className="px-4 py-3 border-b border-black/[0.08]">
            <p className="text-[13px] text-[#6C6C70] mb-1">Date</p>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-[17px] text-black focus:outline-none bg-transparent"
            />
          </div>
          <div className="px-4 py-3">
            <p className="text-[13px] text-[#6C6C70] mb-1">Comments</p>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Optional notes about the work done…"
              rows={3}
              className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent resize-none"
            />
          </div>
        </InsetGroup>

        {error && <p className="text-[#FF3B30] text-[13px] px-4 mb-4">{error}</p>}

        <div className="mb-6">
          <button
            onClick={handleAdd}
            disabled={saving || !date}
            className="w-full bg-[#007AFF] text-white rounded-[12px] py-[14px] text-[17px] font-semibold disabled:opacity-40 active:opacity-80 transition-opacity"
          >
            {saving ? 'Saving…' : 'Log Entry'}
          </button>
        </div>

        {/* History */}
        {loading && (
          <div className="text-center py-8 text-[#8E8E93] text-[15px]">Loading…</div>
        )}

        {!loading && history.length > 0 && (
          <InsetGroup label="Previous Entries">
            {history.map((entry, i) => (
              <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#007AFF] shrink-0" />
                  {i < history.length - 1 && (
                    <div className="w-px flex-1 bg-[#C7C7CC] mt-1.5 min-h-[20px]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <p className="text-[15px] font-semibold text-black">{formatDate(entry.date)}</p>
                  {entry.comments && (
                    <p className="text-[15px] text-[#3C3C43] mt-0.5 break-words leading-snug">{entry.comments}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-[#FF3B30] text-[13px] shrink-0 mt-0.5 active:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </InsetGroup>
        )}

        {!loading && history.length === 0 && (
          <div className="text-center py-6 text-[#8E8E93] text-[15px]">
            No maintenance records yet
          </div>
        )}

        <div className="h-4" />
      </div>
    </Sheet>
  )
}
