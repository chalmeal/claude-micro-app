import { render, screen } from '@testing-library/react'
import { RoleBadge, StatusBadge, GradeBadge, CategoryBadge } from '../Badge'

describe('RoleBadge', () => {
  it('admin を「管理者」と表示する', () => {
    render(<RoleBadge role="admin" />)
    expect(screen.getByText('管理者')).toBeInTheDocument()
  })

  it('member を「メンバー」と表示する', () => {
    render(<RoleBadge role="member" />)
    expect(screen.getByText('メンバー')).toBeInTheDocument()
  })

  it('role に応じた CSS クラスが付く', () => {
    render(<RoleBadge role="admin" />)
    expect(screen.getByText('管理者')).toHaveClass('badge--role-admin')
  })
})

describe('StatusBadge', () => {
  it('active を「有効」と表示する', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('有効')).toBeInTheDocument()
  })

  it('inactive を「無効」と表示する', () => {
    render(<StatusBadge status="inactive" />)
    expect(screen.getByText('無効')).toBeInTheDocument()
  })

  it('status に応じた CSS クラスが付く', () => {
    const { container } = render(<StatusBadge status="active" />)
    expect(container.firstChild).toHaveClass('status--active')
  })
})

describe('GradeBadge', () => {
  it('成績レターを表示する', () => {
    render(<GradeBadge letter="A" />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('letter に応じた CSS クラスが付く', () => {
    render(<GradeBadge letter="S" />)
    expect(screen.getByText('S')).toHaveClass('grade-badge--s')
  })

  it('追加クラスが適用される', () => {
    render(<GradeBadge letter="B" className="custom" />)
    expect(screen.getByText('B')).toHaveClass('custom')
  })
})

describe('CategoryBadge', () => {
  it('important を「重要」と表示する', () => {
    render(<CategoryBadge category="important" />)
    expect(screen.getByText('重要')).toBeInTheDocument()
  })

  it('info を「お知らせ」と表示する', () => {
    render(<CategoryBadge category="info" />)
    expect(screen.getByText('お知らせ')).toBeInTheDocument()
  })

  it('maintenance を「メンテナンス」と表示する', () => {
    render(<CategoryBadge category="maintenance" />)
    expect(screen.getByText('メンテナンス')).toBeInTheDocument()
  })
})
