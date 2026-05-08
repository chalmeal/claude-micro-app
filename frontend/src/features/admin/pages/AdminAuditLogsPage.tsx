import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuditAction, AuditLog, AuditLogsFilter } from '@/features/admin/types'
import { useAuditLogs, defaultAuditLogsFilter } from '@/features/admin/hooks/useAuditLogs'
import { AuditBadge } from '@/shared/components/Badge'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { ResultCount } from '@/shared/components/ResultCount'
import { SkeletonRows } from '@/shared/components/SkeletonRows'
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
  if (!detail || Object.keys(detail).length === 0)
    return <span className="audit-detail-empty">—</span>
  return (
    <span className="audit-detail">
      <button
        type="button"
        className={`audit-detail__toggle${open ? ' audit-detail__toggle--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        詳細
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <pre className="audit-detail__json">{JSON.stringify(detail, null, 2)}</pre>}
    </span>
  )
}

const columns: Column<AuditLog>[] = [
  {
    key: 'createdAt',
    label: '日時',
    className: 'audit-table__date',
    render: (log) => formatDate(log.createdAt),
  },
  {
    key: 'userEmail',
    label: '操作者',
    className: 'audit-table__email',
    render: (log) => log.userEmail,
  },
  {
    key: 'action',
    label: 'アクション',
    render: (log) => <AuditBadge action={log.action} label={actionLabel(log.action)} />,
  },
  {
    key: 'targetType',
    label: '対象',
    className: 'audit-table__target',
    render: (log) =>
      log.targetType ? (
        <span>{targetTypeLabel(log.targetType)}</span>
      ) : (
        <span className="audit-detail-empty">—</span>
      ),
  },
  {
    key: 'detail',
    label: '詳細',
    render: (log) => <DetailCell detail={log.detail} />,
  },
]

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

  const rangeStart = total === 0 ? 0 : (page - 1) * 30 + 1
  const rangeEnd = Math.min(page * 30, total)

  return (
    <div className="audit-page">
      <Link to="/admin" className="audit-page__back">
        ← 管理に戻る
      </Link>

      <PageHeader title="監査ログ" description="管理操作の記録を確認できます" />

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
                <option key={value} value={value}>
                  {label}
                </option>
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
          <button type="reset" className="audit-filter__reset">
            リセット
          </button>
          <button type="submit" className="audit-filter__submit">
            絞り込む
          </button>
        </div>
      </form>

      <ErrorAlert error={error} />

      {loading ? (
        <SkeletonRows count={8} rowHeight={40} />
      ) : (
        <>
          <ResultCount
            total={total}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            emptyMessage="該当するログはありません"
          />
          <DataTable
            columns={columns}
            rows={items}
            getRowKey={(log) => log.id}
            emptyMessage="ログが登録されていません"
            className="audit-table-wrap"
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
