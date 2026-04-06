import { useState } from 'react'
import { useRefueling } from '../hooks/useRefueling'
import { RefuelingForm } from './RefuelingForm'
import { InsetGroup } from './Layout'

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('de-DE', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-[12px] px-4 py-4 flex-1 text-center">
      <p className="text-[28px] font-bold text-black tracking-tight">{value}</p>
      {sub && <p className="text-[13px] text-[#007AFF] font-medium">{sub}</p>}
      <p className="text-[12px] text-[#8E8E93] mt-1">{label}</p>
    </div>
  )
}

export function RefuelingHistory({ showAdd, onAddClose }) {
  const { entries, loading, error, addEntry, deleteEntry } = useRefueling()
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleDelete = async (id) => {
    try { await deleteEntry(id) } catch (err) { alert(err.message) }
    setConfirmDelete(null)
  }

  // Summary stats
  const totalLiters = entries.reduce((sum, e) => sum + parseFloat(e.liters), 0)
  const latestConsumption = entries.find(e => e.consumption != null)?.consumption
  const avgConsumption = entries.filter(e => e.consumption != null).length > 0
    ? entries.filter(e => e.consumption != null).reduce((sum, e) => sum + e.consumption, 0) /
      entries.filter(e => e.consumption != null).length
    : null

  return (
    <>
      {loading && <div className="text-center py-16 text-[#8E8E93] text-[15px]">Loading…</div>}

      {error && (
        <div className="bg-white rounded-[12px] px-4 py-4 text-[#FF3B30] text-[15px]">Error: {error}</div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">⛽</p>
          <p className="text-[17px] font-semibold text-black mb-1">Keine Einträge</p>
          <p className="text-[15px] text-[#8E8E93]">Tippe + um den ersten Tankvorgang einzutragen.</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="flex gap-3 mb-6">
            <StatCard
              label="Gesamt getankt"
              value={`${totalLiters.toFixed(0)} L`}
            />
            {latestConsumption != null && (
              <StatCard
                label="Letzter Verbrauch"
                value={`${latestConsumption.toFixed(1)}`}
                sub="L/h"
              />
            )}
            {avgConsumption != null && (
              <StatCard
                label="Ø Verbrauch"
                value={`${avgConsumption.toFixed(1)}`}
                sub="L/h"
              />
            )}
          </div>

          {/* Entry list */}
          <InsetGroup label="Tankvorgänge">
            {entries.map((entry, i) => (
              <div key={entry.id}>
                <div className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Date + liters headline */}
                      <div className="flex items-baseline gap-3">
                        <p className="text-[17px] font-semibold text-black">{formatDate(entry.date)}</p>
                        <p className="text-[17px] text-[#007AFF] font-semibold">{entry.liters} L</p>
                      </div>

                      {/* Engine hours */}
                      <p className="text-[13px] text-[#8E8E93] mt-1">
                        Motorstunden: {entry.engine_hours.toLocaleString('de-DE')} h
                      </p>

                      {/* Consumption since last refuel */}
                      {entry.consumption != null ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#F2F2F7] rounded-full px-3 py-1">
                          <span className="text-[12px] font-medium text-[#3C3C43]">
                            Verbrauch seit letztem Tanken:
                          </span>
                          <span className="text-[12px] font-bold text-[#007AFF]">
                            {entry.consumption.toFixed(2)} L/h
                          </span>
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#C7C7CC] mt-2">Erster Eintrag – kein Vorwert</p>
                      )}

                      {/* Notes */}
                      {entry.notes && (
                        <p className="text-[13px] text-[#8E8E93] mt-1 italic">{entry.notes}</p>
                      )}
                    </div>

                    {/* Delete button */}
                    {confirmDelete === entry.id ? (
                      <div className="flex gap-2 shrink-0 mt-0.5">
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[13px] text-[#8E8E93]"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-[13px] text-[#FF3B30] font-medium"
                        >
                          Löschen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(entry.id)}
                        className="text-[13px] text-[#C7C7CC] shrink-0 mt-0.5 active:opacity-50"
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                </div>

                {/* Divider (not after last item) */}
                {i < entries.length - 1 && (
                  <div className="h-px bg-black/[0.08] ml-4" />
                )}
              </div>
            ))}
          </InsetGroup>
        </>
      )}

      {showAdd && (
        <RefuelingForm onSave={addEntry} onClose={onAddClose} />
      )}
    </>
  )
}
