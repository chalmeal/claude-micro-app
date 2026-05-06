import { useCallback, useEffect, useState } from 'react'
import { getUserById } from '@/features/users/api/getUsers'
import type { User } from '@/features/users/types'

type UserData = {
  user: User | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useUser(id: string | undefined): UserData {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState<Error | null>(null)
  const [reloadCounter, setReloadCounter] = useState(0)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      try {
        const data = await getUserById(id!)
        if (!cancelled) {
          setUser(data)
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, reloadCounter])

  const refetch = useCallback(() => {
    setReloadCounter((c) => c + 1)
  }, [])

  if (!id) {
    return { user: null, loading: false, error: null, refetch }
  }

  return { user, loading, error, refetch }
}
