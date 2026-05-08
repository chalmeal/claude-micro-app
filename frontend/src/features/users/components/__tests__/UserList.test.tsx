import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserList } from '../UserList'
import type { User } from '@/features/users/types'

const users: User[] = [
  { id: '1', name: '田中太郎', email: 'tanaka@example.com', role: 'admin', status: 'active', createdAt: '2024-01-10' },
  { id: '2', name: '鈴木花子', email: 'suzuki@example.com', role: 'member', status: 'inactive', createdAt: '2024-02-15' },
]

describe('UserList', () => {
  it('ユーザーの名前とメールを表示する', () => {
    render(<MemoryRouter><UserList users={users} /></MemoryRouter>)
    expect(screen.getByText('田中太郎')).toBeInTheDocument()
    expect(screen.getByText('tanaka@example.com')).toBeInTheDocument()
  })

  it('ロールバッジを表示する', () => {
    render(<MemoryRouter><UserList users={users} /></MemoryRouter>)
    expect(screen.getByText('管理者')).toBeInTheDocument()
    expect(screen.getByText('メンバー')).toBeInTheDocument()
  })

  it('ステータスバッジを表示する', () => {
    render(<MemoryRouter><UserList users={users} /></MemoryRouter>)
    expect(screen.getByText('有効')).toBeInTheDocument()
    expect(screen.getByText('無効')).toBeInTheDocument()
  })

  it('登録日を表示する', () => {
    render(<MemoryRouter><UserList users={users} /></MemoryRouter>)
    expect(screen.getByText('2024-01-10')).toBeInTheDocument()
  })

  it('行に aria-label が設定される', () => {
    render(<MemoryRouter><UserList users={users} /></MemoryRouter>)
    expect(screen.getByRole('row', { name: '田中太郎 の詳細を表示' })).toBeInTheDocument()
  })

  it('行にクリック可能なクラスが付く', () => {
    const { container } = render(<MemoryRouter><UserList users={users} /></MemoryRouter>)
    const rows = container.querySelectorAll('tr.data-table__row--clickable')
    expect(rows.length).toBe(users.length)
  })

  it('ユーザーが空のときはメッセージを表示する', () => {
    render(<MemoryRouter><UserList users={[]} /></MemoryRouter>)
    expect(screen.getByText('ユーザーが登録されていません')).toBeInTheDocument()
  })
})
