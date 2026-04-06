import { useState } from 'react'
import { Sheet, InsetGroup, NavButton } from './Layout'

export function RefuelingForm({ onSave, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [liters, setLiters] = useState('')
  const [engineHours, setEngineHours] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const valid = date && liters && engineHours

  const handleSave = async () => {
    if (!valid) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        date,
        liters: parseFloat(liters),
        engine_hours: parseFloat(engineHours),
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Sheet onClose={onClose}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <NavButton onClick={onClose}>Cancel</NavButton>
        <span className="text-[17px] font-semibold text-black">Tanken</span>
        <NavButton onClick={handleSave} disabled={saving || !valid}>
          {saving ? 'Saving…' : 'Save'}
        </NavButton>
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-2">
        <InsetGroup label="Datum">
          <div className="px-4 py-3">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-[17px] text-black focus:outline-none bg-transparent"
            />
          </div>
        </InsetGroup>

        <InsetGroup label="Tankvorgang">
          <div className="px-4 py-3 border-b border-black/[0.08]">
            <p className="text-[13px] text-[#6C6C70] mb-1">Getankte Menge (Liter)</p>
            <input
              type="number"
              min="0"
              step="0.1"
              value={liters}
              onChange={e => setLiters(e.target.value)}
              placeholder="z.B. 45.5"
              className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
            />
          </div>
          <div className="px-4 py-3">
            <p className="text-[13px] text-[#6C6C70] mb-1">Motorstunden</p>
            <input
              type="number"
              min="0"
              step="0.1"
              value={engineHours}
              onChange={e => setEngineHours(e.target.value)}
              placeholder="z.B. 1234.5"
              className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
            />
          </div>
        </InsetGroup>

        <InsetGroup label="Notizen (optional)">
          <div className="px-4 py-3">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="z.B. Hafen Palma, Hochseefahrt…"
              rows={3}
              className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent resize-none"
            />
          </div>
        </InsetGroup>

        {error && <p className="text-[#FF3B30] text-[13px] px-4 mb-4">{error}</p>}
        <div className="h-4" />
      </div>
    </Sheet>
  )
}
