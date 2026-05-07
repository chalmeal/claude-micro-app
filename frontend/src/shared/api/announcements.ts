import { apiFetch, isAbortError } from '@/shared/api/client'
import type { Announcement } from '@/shared/types'

export async function getAnnouncements(signal?: AbortSignal): Promise<Announcement[]> {
  return apiFetch<Announcement[]>('/announcements', { signal })
}

export async function getRecentAnnouncements(
  limit = 5,
  signal?: AbortSignal,
): Promise<Announcement[]> {
  return apiFetch<Announcement[]>(`/announcements?limit=${limit}`, { signal })
}

export async function getAnnouncementById(
  id: string,
  signal?: AbortSignal,
): Promise<Announcement | undefined> {
  try {
    return await apiFetch<Announcement>(`/announcements/${id}`, { signal })
  } catch (err) {
    if (isAbortError(err)) throw err
    return undefined
  }
}

export async function createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Announcement> {
  return apiFetch<Announcement>('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAnnouncement(
  id: string,
  data: Omit<Announcement, 'id'>,
): Promise<Announcement> {
  return apiFetch<Announcement>(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await apiFetch(`/announcements/${id}`, { method: 'DELETE' })
}
