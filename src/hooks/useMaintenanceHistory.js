import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMaintenanceHistory(equipmentId) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    if (!equipmentId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('maintenance_history')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('date', { ascending: false })
    if (error) setError(error.message)
    else setHistory(data)
    setLoading(false)
  }, [equipmentId])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const addEntry = async ({ date, comments }) => {
    const { error } = await supabase
      .from('maintenance_history')
      .insert({ equipment_id: equipmentId, date, comments })
    if (error) throw error
    await fetchHistory()
  }

  const deleteEntry = async (id) => {
    const { error } = await supabase.from('maintenance_history').delete().eq('id', id)
    if (error) throw error
    await fetchHistory()
  }

  return { history, loading, error, addEntry, deleteEntry }
}
