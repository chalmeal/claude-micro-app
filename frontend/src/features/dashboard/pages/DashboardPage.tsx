import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { AnnouncementList } from '@/shared/components/AnnouncementList'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import './DashboardPage.css'

export function DashboardPage() {
  const { user } = useAuth()
  const { announcements, loading, error } = useDashboard()

  return (
    <div className="dashboard">
      <section className="dashboard__intro">
        <h1>ダッシュボード</h1>
        <p>ようこそ、{user?.email} さん</p>
      </section>

      {error && (
        <p className="dashboard__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">お知らせ</h2>
          <Link to="/announcements" className="dashboard__view-all">
            すべて見る
            <svg
              width="14"
              height="14"
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
        </div>

        {loading ? (
          <ul className="announcement-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="announcement-item announcement-item--skeleton" />
            ))}
          </ul>
        ) : (
          <AnnouncementList items={announcements} />
        )}
      </section>
    </div>
  )
}
