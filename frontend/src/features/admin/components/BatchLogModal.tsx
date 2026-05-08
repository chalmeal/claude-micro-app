import { useEffect, useRef, useState } from 'react'
import type { BatchJob, BatchLogEntry, BatchRun } from '@/features/admin/types'
import { getBatchRunLogs, getBatchRuns } from '@/features/admin/api/batches'
import { isAbortError } from '@/shared/api/client'
import './BatchModal.css'

type Props = {
  batch: BatchJob
  onClose: () => void
}

const STATUS_LABEL = { success: '正常', failed: '失敗', running: '実行中' } as const
const LEVEL_LABEL  = { info: 'INFO', warn: 'WARN', error: 'ERROR' } as const
const PAGE_SIZE = 5

function formatDuration(sec: number | null): string {
  if (sec === null) return '—'
  if (sec < 60) return `${sec}秒`
  const m = Math.floor(sec / 60), s = sec % 60
  return s ? `${m}分${s}秒` : `${m}分`
}

export function BatchLogModal({ batch, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const batchId = batch.id

  const [runs, setRuns]               = useState<BatchRun[]>([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [openRun, setOpenRun]         = useState<string | null>(null)
  const [loadingLogs, setLoadingLogs] = useState<Set<string>>(new Set())

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const result = await getBatchRuns(batchId, 0, PAGE_SIZE, controller.signal)
        setRuns(result.items)
        setTotal(result.total)
        setLoading(false)
      } catch (err) {
        if (isAbortError(err)) return
      }
    }
    load()
    return () => controller.abort()
  }, [batchId])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      const result = await getBatchRuns(batchId, runs.length, PAGE_SIZE)
      setRuns((prev) => [...prev, ...result.items])
      setTotal(result.total)
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleToggleRun(run: BatchRun) {
    if (openRun === run.id) { setOpenRun(null); return }
    setOpenRun(run.id)
    if (run.logs !== undefined) return

    setLoadingLogs((s) => new Set(s).add(run.id))
    try {
      const logs: BatchLogEntry[] = await getBatchRunLogs(run.id)
      setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, logs } : r)))
    } finally {
      setLoadingLogs((s) => { const n = new Set(s); n.delete(run.id); return n })
    }
  }

  const hasMore = runs.length < total

  return (
    <div
      className="batch-modal-backdrop"
      ref={backdropRef}
      onMouseDown={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="batch-modal batch-modal--lg" role="dialog" aria-modal="true" tabIndex={-1}>
        <div className="batch-modal__header">
          <div className="batch-modal__header-text">
            <h2 className="batch-modal__title">実行ログ</h2>
            <span className="batch-modal__subtitle">{batch.name}</span>
          </div>
          <button className="batch-modal__close" onClick={onClose} aria-label="閉じる">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="batch-modal__body">
          {loading ? (
            <div className="batch-log__skeleton">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="batch-log__skeleton-row" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <p className="batch-log__empty">実行ログはありません</p>
          ) : (
            <>
              <ul className="batch-log__runs">
                {runs.map((run) => {
                  const isOpen = openRun === run.id
                  const isLoadingLogs = loadingLogs.has(run.id)
                  return (
                    <li key={run.id} className="batch-log__run">
                      <div className="batch-log__run-header" onClick={() => handleToggleRun(run)}>
                        <StatusBadge status={run.status} label={STATUS_LABEL[run.status]} />
                        <div className="batch-log__run-meta">
                          <span className="batch-log__run-time">{run.startedAt}</span>
                          <span>所要: {formatDuration(run.duration)}</span>
                        </div>
                        <svg
                          className={`batch-log__run-chevron${isOpen ? ' batch-log__run-chevron--open' : ''}`}
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                      {isOpen && (
                        <div className="batch-log__entries">
                          {isLoadingLogs ? (
                            <span className="batch-log__entry-loading">読み込み中...</span>
                          ) : run.logs && run.logs.length > 0 ? (
                            run.logs.map((entry, i) => (
                              <div key={i} className="batch-log__entry">
                                <span className="batch-log__entry-time">{entry.timestamp}</span>
                                <span className={`batch-log__entry-level--${entry.level}`}>{LEVEL_LABEL[entry.level]}</span>
                                <span className={`batch-log__entry-msg--${entry.level}`}>{entry.message}</span>
                              </div>
                            ))
                          ) : (
                            <span className="batch-log__entry-loading">ログはありません</span>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              {hasMore && (
                <button
                  className="batch-log__more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? '読み込み中…' : `さらに表示（残り ${total - runs.length} 件）`}
                </button>
              )}
            </>
          )}
        </div>

        <div className="batch-modal__footer">
          <button className="batch-modal__cancel" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, label }: { status: BatchRun['status']; label: string }) {
  const colors: Record<BatchRun['status'], string> = {
    success: '#10B981',
    failed:  '#EF4444',
    running: '#2563EB',
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: colors[status] }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors[status], display: 'inline-block' }} />
      {label}
    </span>
  )
}
