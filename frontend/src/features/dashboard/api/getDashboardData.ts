import { getRecentAnnouncements } from '@/shared/api/announcements'
import type { Announcement } from '@/shared/types'

export async function getDashboardAnnouncements(signal?: AbortSignal): Promise<Announcement[]> {
  return getRecentAnnouncements(5, signal)
}
