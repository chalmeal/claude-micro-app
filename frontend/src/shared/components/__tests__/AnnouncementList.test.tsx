import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnouncementList } from '../AnnouncementList'
import type { Announcement } from '@/shared/types'

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'システムメンテナンスのお知らせ',
    body: '2024年2月1日にメンテナンスを実施します。',
    date: '2024-01-15',
    category: 'maintenance',
  },
  {
    id: '2',
    title: '重要なお知らせ',
    body: 'セキュリティアップデートを適用しました。',
    date: '2024-01-20',
    category: 'important',
  },
]

describe('AnnouncementList', () => {
  it('items が空のときは「お知らせはありません」を表示する', () => {
    render(<AnnouncementList items={[]} />)
    expect(screen.getByText('お知らせはありません')).toBeInTheDocument()
  })

  it('お知らせのタイトルを表示する', () => {
    render(<AnnouncementList items={announcements} />)
    expect(screen.getByText('システムメンテナンスのお知らせ')).toBeInTheDocument()
    expect(screen.getByText('重要なお知らせ')).toBeInTheDocument()
  })

  it('初期状態ではトグルボタンの aria-expanded が false', () => {
    render(<AnnouncementList items={announcements} />)
    const toggle = screen.getByRole('button', { name: /システムメンテナンス/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('タイトルをクリックすると aria-expanded が true になる', async () => {
    render(<AnnouncementList items={announcements} />)
    const toggle = screen.getByRole('button', { name: /システムメンテナンス/ })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('展開後に再クリックすると aria-expanded が false に戻る', async () => {
    render(<AnnouncementList items={announcements} />)
    const toggle = screen.getByRole('button', { name: /システムメンテナンス/ })
    await userEvent.click(toggle)
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('展開後は本文が表示される（--open クラスが付く）', async () => {
    const { container } = render(<AnnouncementList items={announcements} />)
    const toggle = screen.getByRole('button', { name: /システムメンテナンス/ })
    await userEvent.click(toggle)
    const content = container.querySelector('.announcement-item__content--open')
    expect(content).toBeInTheDocument()
  })

  it('複数のお知らせを独立して展開できる', async () => {
    const { container } = render(<AnnouncementList items={announcements} />)
    const [first, second] = screen.getAllByRole('button')
    await userEvent.click(first)
    await userEvent.click(second)
    const openContents = container.querySelectorAll('.announcement-item__content--open')
    expect(openContents).toHaveLength(2)
  })

  it('カテゴリバッジを表示する', () => {
    render(<AnnouncementList items={announcements} />)
    expect(screen.getByText('メンテナンス')).toBeInTheDocument()
    expect(screen.getByText('重要')).toBeInTheDocument()
  })
})
