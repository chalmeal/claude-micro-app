import { useState } from 'react'
import type { Announcement } from '@/shared/types'
import './AnnouncementList.css'

type Props = {
  items: Announcement[]
}

const CATEGORY_LABELS: Record<Announcement['category'], string> = {
  important: '重要',
  info: 'お知らせ',
  maintenance: 'メンテナンス',
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

function AnnouncementItem({ item }: { item: Announcement }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="announcement-item">
      <span className={`announcement-item__accent announcement-item__accent--${item.category}`} />
      <div className="announcement-item__body">
        <button
          className="announcement-item__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <div className="announcement-item__header">
            <span className={`announcement-badge announcement-badge--${item.category}`}>
              {CATEGORY_LABELS[item.category]}
            </span>
            <h3 className="announcement-item__title">{item.title}</h3>
            <time className="announcement-item__date" dateTime={item.date}>
              {formatDate(item.date)}
            </time>
          </div>
          <svg
            className={`announcement-item__chevron${expanded ? ' announcement-item__chevron--open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div
          className={`announcement-item__content${expanded ? ' announcement-item__content--open' : ''}`}
        >
          <div className="announcement-item__content-inner">
            <p className="announcement-item__text">{item.body}</p>
          </div>
        </div>
      </div>
    </li>
  )
}

export function AnnouncementList({ items }: Props) {
  if (items.length === 0) {
    return <p className="announcement-list__empty">お知らせはありません</p>
  }

  return (
    <ul className="announcement-list">
      {items.map((item) => (
        <AnnouncementItem key={item.id} item={item} />
      ))}
    </ul>
  )
}
