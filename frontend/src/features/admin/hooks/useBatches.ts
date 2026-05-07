import { useEffect, useState } from 'react'
import type { BatchJob } from '@/features/admin/types'
import { getBatches } from '@/features/admin/api/batches'
import { isAbortError } from '@/shared/api/client'

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
    const controller = new AbortController()

    async function load() {
      try {
        const data = await getBatches(controller.signal)
        setBatches(data)
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

  return { batches, loading, error, setBatches }
}
