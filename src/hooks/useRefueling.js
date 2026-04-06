import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useRefueling() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('refueling_entries')
      .select('*')
      .order('engine_hours', { ascending: true })
    if (error) { setError(error.message); setLoading(false); return }

    // Calculate consumption per entry: liters / engine hours since last refuel
    const withConsumption = data.map((entry, i) => {
      if (i === 0) return { ...entry, consumption: null }
      const hoursDiff = entry.engine_hours - data[i - 1].engine_hours
      const consumption = hoursDiff > 0 ? entry.liters / hoursDiff : null
      return { ...entry, consumption }
    })

    // Show newest first in the UI
    setEntries(withConsumption.reverse())
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const addEntry = async ({ date, liters, engine_hours, notes }) => {
    const { error } = await supabase
      .from('refueling_entries')
      .insert({ date, liters, engine_hours, notes: notes || null })
    if (error) throw error
    await fetchEntries()
  }

  const deleteEntry = async (id) => {
    const { error } = await supabase.from('refueling_entries').delete().eq('id', id)
    if (error) throw error
    await fetchEntries()
  }

  return { entries, loading, error, addEntry, deleteEntry }
}
