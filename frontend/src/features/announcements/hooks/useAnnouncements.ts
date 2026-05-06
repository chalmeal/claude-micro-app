import { useEffect, useState } from 'react'
import type { Announcement } from '@/shared/types'
import { getAnnouncements, getRecentAnnouncements } from '@/features/announcements/api/getAnnouncements'

type AnnouncementsData = {
  announcements: Announcement[]
  loading: boolean
  error: Error | null
}

export function useAnnouncements(): AnnouncementsData {
  return useAnnouncementsBase(() => getAnnouncements())
}

export function useRecentAnnouncements(limit = 5): AnnouncementsData {
  return useAnnouncementsBase(() => getRecentAnnouncements(limit))
}

function useAnnouncementsBase(fetcher: () => Promise<Announcement[]>): AnnouncementsData {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetcher()
        if (!cancelled) setAnnouncements(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { announcements, loading, error }
}
