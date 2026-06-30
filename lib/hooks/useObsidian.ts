'use client'

import { useState, useEffect, useCallback } from 'react'

export function useObsidian<T extends { id: string }>(entity: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/obsidian/${entity}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setItems(await res.json())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [entity])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (item: T) => {
    setItems(prev => [item, ...prev])
    try {
      await fetch(`/api/obsidian/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
    } catch {
      setItems(prev => prev.filter(i => i.id !== item.id))
    }
  }, [entity])

  const update = useCallback(async (item: T) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i))
    try {
      await fetch(`/api/obsidian/${entity}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
    } catch {
      load()
    }
  }, [entity, load])

  const remove = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    try {
      await fetch(`/api/obsidian/${entity}/${id}`, { method: 'DELETE' })
    } catch {
      load()
    }
  }, [entity, load])

  return { items, loading, error, create, update, remove, reload: load }
}
