import { Link } from 'react-router-dom'
import './AdminPage.css'

const SECTIONS = [
  {
    to: '/admin/announcements',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: 'お知らせ',
    description: 'お知らせの作成・編集・削除',
  },
  {
    to: '/admin/batches',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <polyline points="17 8 12 13 7 8" />
      </svg>
    ),
    title: 'バッチ',
    description: '実行ログ・再実行・スケジュール設定',
  },
  {
    to: '/admin/audit-logs',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: '監査ログ',
    description: '管理操作の記録を確認',
  },
]

export function AdminPage() {
  return (
    <div className="admin-page">
      <section className="admin-page__intro">
        <h1>管理</h1>
        <p>各種設定・管理を行います</p>
      </section>

      <div className="admin-page__grid">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="admin-card">
            <div className="admin-card__icon">{s.icon}</div>
            <div className="admin-card__body">
              <h2 className="admin-card__title">{s.title}</h2>
              <p className="admin-card__desc">{s.description}</p>
            </div>
            <svg
              className="admin-card__arrow"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
