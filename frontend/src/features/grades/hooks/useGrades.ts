import { useCallback, useEffect, useRef, useState } from 'react'
import { getGrades } from '@/features/grades/api/getGrades'
import { isAbortError } from '@/shared/api/client'
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
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  const search = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller

    setLoading(true)
    setError(null)
    try {
      const data = await getGrades(signal)
      if (!signal.aborted) setGrades(data)
    } catch (err) {
      if (isAbortError(err)) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [])

  return { grades, loading, error, search }
}
