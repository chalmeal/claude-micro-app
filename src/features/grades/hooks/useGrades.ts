import { useCallback, useState } from 'react'
import { getGrades } from '@/features/grades/api/getGrades'
import type { Grade } from '@/features/grades/types'

type GradesData = {
  grades: Grade[]
  loading: boolean
  error: Error | null
  search: () => Promise<void>
}

export function useGrades(): GradesData {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getGrades()
      setGrades(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  return { grades, loading, error, search }
}
