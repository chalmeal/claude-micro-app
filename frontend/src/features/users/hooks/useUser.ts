import { useCallback, useEffect, useState } from 'react'
import { getUserById } from '@/features/users/api/getUsers'
import { isAbortError } from '@/shared/api/client'
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
    const controller = new AbortController()

    async function load() {
      try {
        const data = await getUserById(id!, controller.signal)
        setUser(data)
        setError(null)
        setLoading(false)
      } catch (err) {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [id, reloadCounter])

  const refetch = useCallback(() => {
    setReloadCounter((c) => c + 1)
  }, [])

  if (!id) {
    return { user: null, loading: false, error: null, refetch }
  }

  return { user, loading, error, refetch }
}
