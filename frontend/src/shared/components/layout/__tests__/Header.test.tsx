import { jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth/hooks/authContext'
import { Header } from '../Header'
import { createMockAuthValue, mockMemberUser } from '@/__tests__/testHelpers'

function renderHeader(opts: {
  onMenuClick?: () => void
  authOverrides?: Parameters<typeof createMockAuthValue>[0]
} = {}) {
  const onMenuClick = opts.onMenuClick ?? jest.fn()
  const authValue = createMockAuthValue(opts.authOverrides)

  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <Header onMenuClick={onMenuClick} />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
  return { onMenuClick, authValue }
}

describe('Header', () => {
  it('アプリ名を表示する', () => {
    renderHeader()
    expect(screen.getByText('claude-micro-app')).toBeInTheDocument()
  })

  it('メニューボタンをクリックすると onMenuClick が呼ばれる', async () => {
    const { onMenuClick } = renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })

  it('アバターボタンにメールアドレスの頭文字を表示する', () => {
    renderHeader()
    const avatarButton = screen.getByRole('button', { name: 'ユーザーメニュー' })
    expect(avatarButton).toHaveTextContent(mockMemberUser.email[0].toUpperCase())
  })

  it('アバターをクリックするとドロップダウンメニューが開く', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'ユーザーメニュー' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('ドロップダウンにユーザーのメールアドレスを表示する', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'ユーザーメニュー' }))
    expect(screen.getByText(mockMemberUser.email)).toBeInTheDocument()
  })

  it('ログアウトボタンをクリックすると logout が呼ばれる', async () => {
    const logout = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
    renderHeader({ authOverrides: { logout } })
    await userEvent.click(screen.getByRole('button', { name: 'ユーザーメニュー' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'ログアウト' }))
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('設定を開くと SettingsDialog が表示される', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'ユーザーメニュー' }))
    await userEvent.click(screen.getByRole('menuitem', { name: '設定' }))
    expect(screen.getByRole('dialog', { name: '設定' })).toBeInTheDocument()
  })
})
