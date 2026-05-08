import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteAnnouncement, getAnnouncements } from '@/shared/api/announcements'
import type { Announcement } from '@/shared/types'
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements'
import { CategoryBadge } from '@/shared/components/Badge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { PageHeader } from '@/shared/components/PageHeader'
import { SkeletonRows } from '@/shared/components/SkeletonRows'
import './AdminAnnouncementsPage.css'

const CATEGORY_LABELS: Record<Announcement['category'], string> = {
  important: '重要',
  info: 'お知らせ',
  maintenance: 'メンテナンス',
}

export function AdminAnnouncementsPage() {
  const { announcements, loading, error } = useAnnouncements()
  const [items, setItems] = useState<Announcement[] | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmItem, setConfirmItem] = useState<Announcement | null>(null)

  const list = items ?? announcements

  async function doDelete(id: string) {
    setDeleting(id)
    try {
      await deleteAnnouncement(id)
      const refreshed = await getAnnouncements()
      setItems(refreshed)
    } finally {
      setDeleting(null)
    }
  }

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      label: 'タイトル',
      className: 'admin-announcements__title',
      render: (item) => item.title,
    },
    {
      key: 'category',
      label: 'カテゴリ',
      render: (item) => <CategoryBadge category={item.category} />,
    },
    {
      key: 'date',
      label: '日付',
      className: 'admin-announcements__date',
      render: (item) => item.date,
    },
    {
      key: 'actions',
      label: '',
      className: 'admin-announcements__actions',
      render: (item) => (
        <>
          <Link to={`/admin/announcements/${item.id}/edit`} className="admin-announcements__edit">
            編集
          </Link>
          <button
            className="admin-announcements__delete"
            onClick={(e) => {
              e.stopPropagation()
              setConfirmItem(item)
            }}
            disabled={deleting === item.id}
          >
            {deleting === item.id ? '削除中…' : '削除'}
          </button>
        </>
      ),
    },
  ]

  return (
    <div className="admin-announcements">
      <Link to="/admin" className="admin-announcements__back">
        ← 管理に戻る
      </Link>

      <PageHeader
        title="お知らせ管理"
        description="お知らせの作成・編集・削除を行います"
        action={{ label: '+ 新規作成', to: '/admin/announcements/new' }}
      />

      <ErrorAlert error={error} />

      {confirmItem && (
        <ConfirmDialog
          title="削除の確認"
          message="このお知らせを削除しますか？"
          details={
            <table className="confirm-detail-table">
              <tbody>
                <tr>
                  <th>タイトル</th>
                  <td>{confirmItem.title}</td>
                </tr>
                <tr>
                  <th>カテゴリ</th>
                  <td>{CATEGORY_LABELS[confirmItem.category]}</td>
                </tr>
                <tr>
                  <th>日付</th>
                  <td>{confirmItem.date}</td>
                </tr>
              </tbody>
            </table>
          }
          confirmLabel="削除する"
          dangerous
          onConfirm={() => {
            const id = confirmItem.id
            setConfirmItem(null)
            doDelete(id)
          }}
          onCancel={() => setConfirmItem(null)}
        />
      )}

      {loading ? (
        <SkeletonRows count={4} rowHeight={40} />
      ) : (
        <DataTable
          columns={columns}
          rows={list}
          getRowKey={(item) => item.id}
          emptyMessage="お知らせはありません"
        />
      )}
    </div>
  )
}
