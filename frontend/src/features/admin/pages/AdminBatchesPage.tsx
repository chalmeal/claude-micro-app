import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { BatchJob } from '@/features/admin/types'
import { rerunBatch, updateBatchEnabled } from '@/features/admin/api/batches'
import { useBatches } from '@/features/admin/hooks/useBatches'
import { BatchLogModal } from '@/features/admin/components/BatchLogModal'
import { BatchScheduleModal } from '@/features/admin/components/BatchScheduleModal'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './AdminBatchesPage.css'

const STATUS_CONFIG = {
  success: { label: '正常',   color: '#10B981' },
  failed:  { label: '失敗',   color: '#EF4444' },
  running: { label: '実行中', color: '#2563EB' },
  pending: { label: '待機中', color: '#94A3B8' },
}


function scheduleLabel(job: BatchJob): string {
  const { schedule: s } = job
  const DOW = ['日', '月', '火', '水', '木', '金', '土']
  if (s.frequency === 'minutely') return '毎分'
  if (s.frequency === 'hourly')   return '毎時 0分'
  if (s.frequency === 'daily')    return `毎日 ${s.time}`
  if (s.frequency === 'weekly')   return `毎週${DOW[s.dayOfWeek ?? 1]} ${s.time}`
  return `毎月${s.dayOfMonth ?? 1}日 ${s.time}`
}

export function AdminBatchesPage() {
  const { batches, loading, refreshing, error, setBatches, refresh } = useBatches()
  const snackbar = useSnackbar()
  const [rerunning, setRerunning]       = useState<Set<string>>(new Set())
  const [logBatch, setLogBatch]         = useState<BatchJob | null>(null)
  const [schBatch, setSchBatch]         = useState<BatchJob | null>(null)
  const [confirmRerun, setConfirmRerun] = useState<BatchJob | null>(null)

  async function handleToggleEnabled(job: BatchJob) {
    const next = !job.enabled
    setBatches((prev) => prev.map((b) => (b.id === job.id ? { ...b, enabled: next } : b)))
    try {
      const updated = await updateBatchEnabled(job.id, next)
      setBatches((prev) => prev.map((b) => (b.id === job.id ? updated : b)))
      snackbar.show(`「${job.name}」を${next ? '有効' : '無効'}にしました`)
    } catch {
      setBatches((prev) => prev.map((b) => (b.id === job.id ? { ...b, enabled: job.enabled } : b)))
      snackbar.show('更新に失敗しました', 'error')
    }
  }

  async function doRerun(job: BatchJob) {
    setRerunning((s) => new Set(s).add(job.id))
    setBatches((prev) => prev.map((b) => (b.id === job.id ? { ...b, status: 'running' } : b)))
    try {
      await rerunBatch(job.id)
      setBatches((prev) =>
        prev.map((b) =>
          b.id === job.id
            ? { ...b, status: 'success', lastRunAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
            : b
        )
      )
      snackbar.show(`「${job.name}」を再実行しました`)
    } finally {
      setRerunning((s) => { const n = new Set(s); n.delete(job.id); return n })
    }
  }

  return (
    <div className="batches-page">
      <Link to="/admin" className="batches-page__back">← 管理に戻る</Link>

      <div className="batches-page__head">
        <div>
          <h1>バッチ管理</h1>
          <p>スケジュール・実行状況・ログの確認</p>
        </div>
        <button
          className="batches-page__refresh"
          onClick={refresh}
          disabled={refreshing}
          aria-label="状態を更新"
        >
          <svg
            className={refreshing ? 'spinning' : ''}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {refreshing ? '更新中…' : '更新'}
        </button>
      </div>

      {error && (
        <p className="batches-page__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading ? (
        <div className="batch-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="batch-skeleton__row" />
          ))}
        </div>
      ) : (
        <div className="batch-list">
          {batches.map((job) => {
            const st = STATUS_CONFIG[job.status]
            const isRerunning = rerunning.has(job.id)
            return (
              <div key={job.id} className="batch-card">
                <div className="batch-card__top">
                  <div className="batch-card__title">
                    <span className="batch-card__name">{job.name}</span>
                    {job.description && (
                      <span className="batch-card__desc">{job.description}</span>
                    )}
                  </div>
                  <button
                    className={`batch-toggle${job.enabled ? ' batch-toggle--on' : ''}`}
                    onClick={() => handleToggleEnabled(job)}
                    role="switch"
                    aria-checked={job.enabled}
                    aria-label={job.enabled ? '無効にする' : '有効にする'}
                    disabled={isRerunning}
                  />
                </div>

                <div className="batch-card__meta">
                  <span className="batch-card__status" style={{ color: st.color }}>
                    <span
                      className={`batch-card__dot${job.status === 'running' ? ' batch-card__dot--pulse' : ''}`}
                      style={{ background: st.color }}
                    />
                    {st.label}
                  </span>
                  <span>{scheduleLabel(job)}</span>
                </div>

                <div className="batch-card__foot">
                  <button className="batch-btn" onClick={() => setLogBatch(job)}>
                    ログ
                  </button>
                  <button
                    className="batch-btn"
                    onClick={() => setSchBatch(job)}
                    disabled={isRerunning}
                  >
                    スケジュール
                  </button>
                  {(job.status === 'failed' || isRerunning) && (
                    <button
                      className="batch-btn batch-btn--warn"
                      onClick={() => setConfirmRerun(job)}
                      disabled={isRerunning}
                    >
                      {isRerunning ? '実行中…' : '再実行'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {logBatch && <BatchLogModal batch={logBatch} onClose={() => setLogBatch(null)} />}
      {schBatch && (
        <BatchScheduleModal
          batch={schBatch}
          onClose={() => setSchBatch(null)}
          onSaved={(updated) => {
            setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
            setSchBatch(null)
          }}
        />
      )}

      {confirmRerun && (
        <ConfirmDialog
          title="再実行の確認"
          message={`「${confirmRerun.name}」を再実行しますか？`}
          details={
            <table className="confirm-detail-table">
              <tbody>
                <tr><th>バッチ名</th><td>{confirmRerun.name}</td></tr>
                <tr><th>説明</th><td>{confirmRerun.description}</td></tr>
                <tr><th>ステータス</th><td>{STATUS_CONFIG[confirmRerun.status].label}</td></tr>
              </tbody>
            </table>
          }
          confirmLabel="再実行する"
          onConfirm={() => {
            const job = confirmRerun
            setConfirmRerun(null)
            doRerun(job)
          }}
          onCancel={() => setConfirmRerun(null)}
        />
      )}
    </div>
  )
}
