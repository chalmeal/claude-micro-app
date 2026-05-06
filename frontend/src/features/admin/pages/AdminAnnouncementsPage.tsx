import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteAnnouncement,
  getAnnouncements,
} from '@/shared/api/announcements'
import type { Announcement } from '@/shared/types'
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements'
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

  const list = items ?? announcements

  async function handleDelete(id: string) {
    if (!window.confirm('このお知らせを削除しますか？')) return
    setDeleting(id)
    try {
      await deleteAnnouncement(id)
      const refreshed = await getAnnouncements()
      setItems(refreshed)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="admin-announcements">
      <Link to="/admin" className="admin-announcements__back">
        ← 管理に戻る
      </Link>

      <div className="admin-announcements__intro">
        <div>
          <h1>お知らせ管理</h1>
          <p>お知らせの作成・編集・削除を行います</p>
        </div>
        <Link to="/admin/announcements/new" className="admin-announcements__create">
          + 新規作成
        </Link>
      </div>

      {error && (
        <p className="admin-announcements__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading ? (
        <div className="admin-announcements__skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-announcements__skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="admin-announcements__table-wrap">
          <table className="admin-announcements__table">
            <thead>
              <tr>
                <th>タイトル</th>
                <th>カテゴリ</th>
                <th>日付</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-announcements__empty">
                    お知らせはありません
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id}>
                    <td data-label="タイトル" className="admin-announcements__title">{item.title}</td>
                    <td data-label="カテゴリ">
                      <span className={`announcement-badge announcement-badge--${item.category}`}>
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </td>
                    <td data-label="日付" className="admin-announcements__date">{item.date}</td>
                    <td className="admin-announcements__actions">
                      <Link
                        to={`/admin/announcements/${item.id}/edit`}
                        className="admin-announcements__edit"
                      >
                        編集
                      </Link>
                      <button
                        className="admin-announcements__delete"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                      >
                        {deleting === item.id ? '削除中…' : '削除'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
