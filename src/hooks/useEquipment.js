import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEquipment() {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEquipment = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('equipment')
      .select('*, categories(name)')
      .order('name')
    if (error) setError(error.message)
    else setEquipment(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchEquipment() }, [fetchEquipment])

  const addEquipment = async ({ name, category_id, next_maintenance_date }) => {
    const { error } = await supabase.from('equipment').insert({ name, category_id, next_maintenance_date })
    if (error) throw error
    await fetchEquipment()
  }

  const updateEquipment = async (id, updates) => {
    const { error } = await supabase.from('equipment').update(updates).eq('id', id)
    if (error) throw error
    await fetchEquipment()
  }

  const deleteEquipment = async (id) => {
    const { error } = await supabase.from('equipment').delete().eq('id', id)
    if (error) throw error
    await fetchEquipment()
  }

  return { equipment, loading, error, addEquipment, updateEquipment, deleteEquipment, refetch: fetchEquipment }
}
