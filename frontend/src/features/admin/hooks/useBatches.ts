import { useCallback, useEffect, useState } from 'react'
import type { BatchJob } from '@/features/admin/types'
import { getBatches } from '@/features/admin/api/batches'
import { isAbortError } from '@/shared/api/client'

type Result = {
  batches: BatchJob[]
  loading: boolean
  refreshing: boolean
  error: Error | null
  setBatches: React.Dispatch<React.SetStateAction<BatchJob[]>>
  refresh: () => void
}

export function useBatches(): Result {
  const [batches, setBatches] = useState<BatchJob[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    const isRefresh = refreshKey > 0

    async function load() {
      if (isRefresh) setRefreshing(true)
      try {
        const data = await getBatches(controller.signal)
        setBatches(data)
        setError(null)
      } catch (err) {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    load()
    return () => controller.abort()
  }, [refreshKey])

  return { batches, loading, refreshing, error, setBatches, refresh }
}
