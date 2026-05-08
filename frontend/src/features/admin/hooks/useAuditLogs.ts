import { useEffect, useRef, useState } from 'react'
import { isAbortError } from '@/shared/api/client'
import { getAuditLogs } from '@/features/admin/api/auditLogs'
import type { AuditLog, AuditLogsFilter } from '@/features/admin/types'

export type { AuditLogsFilter }

const PAGE_SIZE = 30

export function defaultAuditLogsFilter(): AuditLogsFilter {
  const d = new Date()
  d.setDate(d.getDate() - 3)
  return { action: '', from: d.toISOString().slice(0, 10), to: '' }
}

export function useAuditLogs() {
  const [items, setItems] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<AuditLogsFilter>(defaultAuditLogsFilter)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await getAuditLogs(
          {
            page,
            limit: PAGE_SIZE,
            action: filter.action || undefined,
            from: filter.from || undefined,
            to: filter.to ? `${filter.to}T23:59:59` : undefined,
          },
          ctrl.signal,
        )
        setItems(res.items)
        setTotal(res.total)
      } catch (err) {
        if (!isAbortError(err)) setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => ctrl.abort()
  }, [page, filter])

  function applyFilter(next: AuditLogsFilter) {
    setFilter(next)
    setPage(1)
  }

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    filter,
    loading,
    error,
    setPage,
    applyFilter,
  }
}
