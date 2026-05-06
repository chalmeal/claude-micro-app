import { useEffect, useState } from 'react'
import { getUsers } from '@/features/users/api/getUsers'
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
    let cancelled = false

    async function load() {
      try {
        const data = await getUsers()
        if (!cancelled) setUsers(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { users, loading, error }
}
