import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { BatchJob } from '@/features/admin/types'
import { rerunBatch } from '@/features/admin/api/batches'
import { useBatches } from '@/features/admin/hooks/useBatches'
import { BatchLogModal } from '@/features/admin/components/BatchLogModal'
import { BatchScheduleModal } from '@/features/admin/components/BatchScheduleModal'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './AdminBatchesPage.css'

const STATUS_CONFIG = {
  success: { label: '正常', color: '#10B981' },
  failed: { label: '失敗', color: '#EF4444' },
  running: { label: '実行中', color: '#2563EB' },
  pending: { label: '待機中', color: '#94A3B8' },
}

function formatDuration(sec: number | null): string {
  if (sec === null) return '—'
  if (sec < 60) return `${sec}秒`
  const m = Math.floor(sec / 60),
    s = sec % 60
  return s ? `${m}分${s}秒` : `${m}分`
}

function scheduleLabel(job: BatchJob): string {
  const { schedule: s } = job
  const DOW = ['日', '月', '火', '水', '木', '金', '土']
  if (s.frequency === 'hourly') return '毎時 0分'
  if (s.frequency === 'daily') return `毎日 ${s.time}`
  if (s.frequency === 'weekly') return `毎週${DOW[s.dayOfWeek ?? 1]} ${s.time}`
  return `毎月${s.dayOfMonth ?? 1}日 ${s.time}`
}

export function AdminBatchesPage() {
  const { batches, loading, error, setBatches } = useBatches()
  const snackbar = useSnackbar()
  const [rerunning, setRerunning] = useState<Set<string>>(new Set())
  const [logBatch, setLogBatch] = useState<BatchJob | null>(null)
  const [schBatch, setSchBatch] = useState<BatchJob | null>(null)
  const [confirmRerun, setConfirmRerun] = useState<BatchJob | null>(null)

  function handleRerun(job: BatchJob) {
    setConfirmRerun(job)
  }

  async function doRerun(job: BatchJob) {
    setRerunning((s) => new Set(s).add(job.id))
    setBatches((prev) => prev.map((b) => (b.id === job.id ? { ...b, status: 'running' } : b)))
    try {
      await rerunBatch(job.id)
      setBatches((prev) =>
        prev.map((b) =>
          b.id === job.id
            ? {
                ...b,
                status: 'success',
                lastRunAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              }
            : b,
        ),
      )
      snackbar.show(`「${job.name}」を再実行しました`)
    } finally {
      setRerunning((s) => {
        const n = new Set(s)
        n.delete(job.id)
        return n
      })
    }
  }

  return (
    <div className="admin-batches">
      <Link to="/admin" className="admin-batches__back">
        ← 管理に戻る
      </Link>

      <div className="admin-batches__intro">
        <div>
          <h1>バッチ管理</h1>
          <p>バッチの実行状況・ログ確認・スケジュール設定を行います</p>
        </div>
      </div>

      {error && (
        <p className="admin-batches__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading ? (
        <div className="admin-batches__skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="admin-batches__skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="admin-batches__table-wrap">
          <table className="admin-batches__table">
            <thead>
              <tr>
                <th>バッチ名</th>
                <th>ステータス</th>
                <th>最終実行</th>
                <th>所要時間</th>
                <th>スケジュール</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((job) => {
                const st = STATUS_CONFIG[job.status]
                const isRerunning = rerunning.has(job.id)
                return (
                  <tr key={job.id}>
                    <td data-label="バッチ名" className="admin-batches__name">
                      <span>{job.name}</span>
                      <span className="admin-batches__desc">{job.description}</span>
                    </td>
                    <td data-label="ステータス">
                      <span className="admin-batches__status" style={{ color: st.color }}>
                        <span
                          className={`admin-batches__dot${job.status === 'running' ? ' admin-batches__dot--pulse' : ''}`}
                          style={{ background: st.color }}
                        />
                        {st.label}
                      </span>
                    </td>
                    <td data-label="最終実行" className="admin-batches__muted">
                      {job.lastRunAt ?? '—'}
                    </td>
                    <td data-label="所要時間" className="admin-batches__muted">
                      {formatDuration(job.lastDuration)}
                    </td>
                    <td data-label="スケジュール" className="admin-batches__muted">
                      {scheduleLabel(job)}
                    </td>
                    <td>
                      <div className="admin-batches__actions">
                        <button className="admin-batches__btn" onClick={() => setLogBatch(job)}>
                          ログ
                        </button>
                        {(job.status === 'failed' || isRerunning) && (
                          <button
                            className="admin-batches__btn admin-batches__btn--rerun"
                            onClick={() => handleRerun(job)}
                            disabled={isRerunning}
                          >
                            {isRerunning ? '実行中…' : '再実行'}
                          </button>
                        )}
                        <button
                          className="admin-batches__btn"
                          onClick={() => setSchBatch(job)}
                          disabled={isRerunning}
                        >
                          スケジュール
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
                <tr><th>現在のステータス</th><td>{STATUS_CONFIG[confirmRerun.status].label}</td></tr>
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
