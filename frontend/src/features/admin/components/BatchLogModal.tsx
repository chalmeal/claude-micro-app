import { useEffect, useRef, useState } from 'react'
import type { BatchJob, BatchRun } from '@/features/admin/types'
import { getBatchRuns } from '@/features/admin/api/batches'
import './BatchModal.css'

type Props = {
  batch: BatchJob
  onClose: () => void
}

const STATUS_LABEL = { success: '正常', failed: '失敗', running: '実行中' } as const
const LEVEL_LABEL  = { info: 'INFO', warn: 'WARN', error: 'ERROR' } as const

function formatDuration(sec: number | null): string {
  if (sec === null) return '—'
  if (sec < 60) return `${sec}秒`
  const m = Math.floor(sec / 60), s = sec % 60
  return s ? `${m}分${s}秒` : `${m}分`
}

export function BatchLogModal({ batch, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const [runs, setRuns]       = useState<BatchRun[]>([])
  const [loading, setLoading] = useState(true)
  const [openRun, setOpenRun] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await getBatchRuns(batch.id)
      if (!cancelled) { setRuns(data); setLoading(false); if (data[0]) setOpenRun(data[0].id) }
    }
    load()
    return () => { cancelled = true }
  }, [batch.id])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="batch-modal__body">
          {loading ? (
            <p className="batch-log__empty">読み込み中...</p>
          ) : runs.length === 0 ? (
            <p className="batch-log__empty">実行ログはありません</p>
          ) : (
            <ul className="batch-log__runs" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {runs.map((run) => {
                const isOpen = openRun === run.id
                return (
                  <li key={run.id} className="batch-log__run">
                    <div
                      className="batch-log__run-header"
                      onClick={() => setOpenRun(isOpen ? null : run.id)}
                    >
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
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    {isOpen && (
                      <div className="batch-log__entries">
                        {run.logs.map((entry, i) => (
                          <div key={i} className="batch-log__entry">
                            <span className="batch-log__entry-time">{entry.timestamp}</span>
                            <span className={`batch-log__entry-level--${entry.level}`}>
                              {LEVEL_LABEL[entry.level]}
                            </span>
                            <span className={`batch-log__entry-msg--${entry.level}`}>
                              {entry.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
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
    failed: '#EF4444',
    running: '#2563EB',
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      fontSize: '0.75rem', fontWeight: 600, color: colors[status],
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: colors[status], display: 'inline-block' }} />
      {label}
    </span>
  )
}
