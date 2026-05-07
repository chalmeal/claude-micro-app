import { useEffect, useState } from 'react'
import type { Announcement } from '@/shared/types'
import {
  getAnnouncements,
  getRecentAnnouncements,
} from '@/features/announcements/api/getAnnouncements'
import { isAbortError } from '@/shared/api/client'

type AnnouncementsData = {
  announcements: Announcement[]
  loading: boolean
  error: Error | null
}

export function useAnnouncements(): AnnouncementsData {
  return useAnnouncementsBase((signal) => getAnnouncements(signal))
}

export function useRecentAnnouncements(limit = 5): AnnouncementsData {
  return useAnnouncementsBase((signal) => getRecentAnnouncements(limit, signal))
}

function useAnnouncementsBase(
  fetcher: (signal: AbortSignal) => Promise<Announcement[]>,
): AnnouncementsData {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await fetcher(controller.signal)
        setAnnouncements(data)
        setLoading(false)
      } catch (err) {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { announcements, loading, error }
}
