import { useEffect, useState } from 'react'
import type { BatchJob } from '@/features/admin/types'
import { getBatches } from '@/features/admin/api/batches'

type Result = {
  batches: BatchJob[]
  loading: boolean
  error: Error | null
  setBatches: React.Dispatch<React.SetStateAction<BatchJob[]>>
}

export function useBatches(): Result {
  const [batches, setBatches] = useState<BatchJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getBatches()
        if (!cancelled) setBatches(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { batches, loading, error, setBatches }
}
