import { useEffect, useState } from 'react'
import { getUsers } from '@/features/users/api/getUsers'
import { isAbortError } from '@/shared/api/client'
import type { User } from '@/features/users/types'

type UsersData = {
  users: User[]
  loading: boolean
  error: Error | null
}

export function useUsers(): UsersData {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await getUsers(controller.signal)
        setUsers(data)
        setLoading(false)
      } catch (err) {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  return { users, loading, error }
}
