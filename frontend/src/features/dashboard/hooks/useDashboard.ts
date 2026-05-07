import { useEffect, useState } from 'react'
import type { Announcement } from '@/shared/types'
import { getDashboardAnnouncements } from '@/features/dashboard/api/getDashboardData'

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
    let cancelled = false

    getDashboardAnnouncements()
      .then((data) => {
        if (!cancelled) setAnnouncements(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { announcements, loading, error }
}
