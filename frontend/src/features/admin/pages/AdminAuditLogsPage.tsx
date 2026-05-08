import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuditAction, AuditLogsFilter } from '@/features/admin/types'
import { useAuditLogs, defaultAuditLogsFilter } from '@/features/admin/hooks/useAuditLogs'
import { Pagination } from '@/shared/components/Pagination'
import './AdminAuditLogsPage.css'

const ACTION_LABELS: Record<AuditAction, string> = {
  'auth.login': 'ログイン',
  'auth.change_password': 'パスワード変更',
  'user.create': 'ユーザー作成',
  'user.update': 'ユーザー更新',
  'announcement.create': 'お知らせ作成',
  'announcement.update': 'お知らせ更新',
  'announcement.delete': 'お知らせ削除',
  'batch.rerun': 'バッチ再実行',
  'batch.schedule_update': 'スケジュール更新',
  'batch.toggle_enabled': 'バッチ有効/無効切替',
}

const ACTION_OPTIONS = Object.entries(ACTION_LABELS) as [AuditAction, string][]

const TARGET_TYPE_LABELS: Record<string, string> = {
  user: 'ユーザー',
  announcement: 'お知らせ',
  batch: 'バッチ',
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action as AuditAction] ?? action
}

function targetTypeLabel(type: string): string {
  return TARGET_TYPE_LABELS[type] ?? type
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function DetailCell({ detail }: { detail: Record<string, unknown> | null }) {
  const [open, setOpen] = useState(false)
  if (!detail || Object.keys(detail).length === 0) return <span className="audit-detail-empty">—</span>
  return (
    <span className="audit-detail">
      <button
        type="button"
        className={`audit-detail__toggle${open ? ' audit-detail__toggle--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        詳細
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <pre className="audit-detail__json">{JSON.stringify(detail, null, 2)}</pre>
      )}
    </span>
  )
}

export function AdminAuditLogsPage() {
  const { items, total, page, totalPages, filter, loading, error, setPage, applyFilter } =
    useAuditLogs()

  const [draft, setDraft] = useState<AuditLogsFilter>(filter)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    applyFilter(draft)
  }

  function handleReset() {
    const defaults = defaultAuditLogsFilter()
    setDraft(defaults)
    applyFilter(defaults)
  }

  return (
    <div className="audit-page">
      <Link to="/admin" className="audit-page__back">← 管理に戻る</Link>

      <div className="audit-page__head">
        <h1>監査ログ</h1>
        <p>管理操作の記録を確認できます</p>
      </div>

      <form className="audit-filter" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="audit-filter__fields">
          <div className="audit-filter__field">
            <label htmlFor="af-action">アクション</label>
            <select
              id="af-action"
              value={draft.action}
              onChange={(e) => setDraft((d: AuditLogsFilter) => ({ ...d, action: e.target.value }))}
            >
              <option value="">すべて</option>
              {ACTION_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="audit-filter__field">
            <label htmlFor="af-from">開始日</label>
            <input
              id="af-from"
              type="date"
              value={draft.from}
              onChange={(e) => setDraft((d: AuditLogsFilter) => ({ ...d, from: e.target.value }))}
            />
          </div>
          <div className="audit-filter__field">
            <label htmlFor="af-to">終了日</label>
            <input
              id="af-to"
              type="date"
              value={draft.to}
              onChange={(e) => setDraft((d: AuditLogsFilter) => ({ ...d, to: e.target.value }))}
            />
          </div>
        </div>
        <div className="audit-filter__actions">
          <button type="reset" className="audit-filter__reset">リセット</button>
          <button type="submit" className="audit-filter__submit">絞り込む</button>
        </div>
      </form>

      {error && (
        <p className="audit-page__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading ? (
        <div className="audit-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="audit-skeleton__row" />
          ))}
        </div>
      ) : (
        <>
          <p className="audit-page__count">
            {total === 0
              ? '該当するログはありません'
              : `${(page - 1) * 30 + 1}–${Math.min(page * 30, total)} 件 / ${total} 件`}
          </p>
          {total === 0 ? (
            <p className="audit-page__empty">ログが登録されていません</p>
          ) : (
            <>
              <div className="audit-table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>日時</th>
                      <th>操作者</th>
                      <th>アクション</th>
                      <th>対象</th>
                      <th>詳細</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((log) => (
                      <tr key={log.id}>
                        <td data-label="日時" className="audit-table__date">
                          {formatDate(log.createdAt)}
                        </td>
                        <td data-label="操作者" className="audit-table__email">
                          {log.userEmail}
                        </td>
                        <td data-label="アクション">
                          <span className={`audit-badge audit-badge--${log.action.split('.')[0]}`}>
                            {actionLabel(log.action)}
                          </span>
                        </td>
                        <td data-label="対象" className="audit-table__target">
                          {log.targetType ? (
                            <span>{targetTypeLabel(log.targetType)}</span>
                          ) : (
                            <span className="audit-detail-empty">—</span>
                          )}
                        </td>
                        <td data-label="詳細">
                          <DetailCell detail={log.detail} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
