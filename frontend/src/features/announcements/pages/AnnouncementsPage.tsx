import { useRef, useState } from 'react'
import { AnnouncementList } from '@/shared/components/AnnouncementList'
import { Pagination } from '@/shared/components/Pagination'
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements'
import './AnnouncementsPage.css'

const PAGE_SIZE = 30

export function AnnouncementsPage() {
  const { announcements, loading, error } = useAnnouncements()
  const [currentPage, setCurrentPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(announcements.length / PAGE_SIZE)
  const pageItems = announcements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handlePageChange(page: number) {
    setCurrentPage(page)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="announcements-page">
      <section className="announcements-page__intro">
        <h1>お知らせ一覧</h1>
        <p>システムからのお知らせを確認できます</p>
      </section>

      {error && (
        <p className="announcements-page__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      <div ref={topRef}>
        {loading ? (
          <ul className="announcement-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="announcement-item announcement-item--skeleton" />
            ))}
          </ul>
        ) : (
          <>
            <AnnouncementList items={pageItems} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
