import { useEffect, useState } from 'react'
import type { Announcement } from '@/shared/types'
import { getDashboardAnnouncements } from '@/features/dashboard/api/getDashboardData'
import { isAbortError } from '@/shared/api/client'

type DashboardData = {
  announcements: Announcement[]
  loading: boolean
  error: Error | null
}

export function useDashboard(): DashboardData {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getDashboardAnnouncements(controller.signal)
      .then((data) => {
        setAnnouncements(data)
        setLoading(false)
      })
      .catch((err) => {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { announcements, loading, error }
}
