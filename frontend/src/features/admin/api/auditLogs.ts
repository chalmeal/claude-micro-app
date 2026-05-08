import { apiFetch } from '@/shared/api/client'
import type { AuditLog } from '@/features/admin/types'

export type AuditLogsQuery = {
  page: number
  limit: number
  action?: string
  from?: string
  to?: string
}

export type AuditLogsResponse = {
  items: AuditLog[]
  total: number
}

export async function getAuditLogs(
  query: AuditLogsQuery,
  signal?: AbortSignal,
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) })
  if (query.action) params.set('action', query.action)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  return apiFetch<AuditLogsResponse>(`/audit-logs?${params}`, { signal })
}
