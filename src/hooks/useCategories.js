import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) setError(error.message)
    else setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const addCategory = async (name) => {
    const { error } = await supabase.from('categories').insert({ name })
    if (error) throw error
    await fetchCategories()
  }

  const deleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    await fetchCategories()
  }

  return { categories, loading, error, addCategory, deleteCategory, refetch: fetchCategories }
}
