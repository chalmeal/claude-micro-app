import { jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth/hooks/authContext'
import { Sidebar } from '../Sidebar'
import { createMockAuthValue } from '@/__tests__/testHelpers'

function renderSidebar(opts: {
  isAdmin?: boolean
  collapsed?: boolean
  mobileOpen?: boolean
  onToggle?: () => void
  onMobileClose?: () => void
} = {}) {
  const onToggle = opts.onToggle ?? jest.fn()
  const onMobileClose = opts.onMobileClose ?? jest.fn()
  const authValue = createMockAuthValue({ isAdmin: opts.isAdmin ?? false })

  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <Sidebar
          collapsed={opts.collapsed ?? false}
          onToggle={onToggle}
          mobileOpen={opts.mobileOpen ?? false}
          onMobileClose={onMobileClose}
        />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
  return { onToggle, onMobileClose }
}

describe('Sidebar', () => {
  it('共通ナビゲーションリンクを表示する', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: 'ダッシュボード' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '成績' })).toBeInTheDocument()
  })

  it('一般ユーザーには adminOnly リンクを表示しない', () => {
    renderSidebar({ isAdmin: false })
    expect(screen.queryByRole('link', { name: 'ユーザー' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '管理' })).not.toBeInTheDocument()
  })

  it('管理者には adminOnly リンクも表示する', () => {
    renderSidebar({ isAdmin: true })
    expect(screen.getByRole('link', { name: 'ユーザー' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '管理' })).toBeInTheDocument()
  })

  it('トグルボタンをクリックすると onToggle が呼ばれる', async () => {
    const { onToggle } = renderSidebar()
    await userEvent.click(screen.getByRole('button', { name: 'サイドバーを閉じる' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('collapsed のときはトグルボタンのラベルが変わる', () => {
    renderSidebar({ collapsed: true })
    expect(screen.getByRole('button', { name: 'サイドバーを開く' })).toBeInTheDocument()
  })

  it('collapsed クラスが付く', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider value={createMockAuthValue()}>
          <Sidebar collapsed={true} onToggle={jest.fn()} mobileOpen={false} onMobileClose={jest.fn()} />
        </AuthContext.Provider>
      </MemoryRouter>,
    )
    expect(container.querySelector('nav')).toHaveClass('app-sidebar--collapsed')
  })

  it('リンクをクリックすると onMobileClose が呼ばれる', async () => {
    const { onMobileClose } = renderSidebar()
    await userEvent.click(screen.getByRole('link', { name: 'ダッシュボード' }))
    expect(onMobileClose).toHaveBeenCalledTimes(1)
  })
})
