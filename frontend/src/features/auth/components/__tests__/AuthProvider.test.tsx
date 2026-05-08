import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'

const STORAGE_KEY = 'claude-micro-app:auth-user'

function AuthConsumer() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  return (
    <div>
      <p data-testid="authenticated">{String(isAuthenticated)}</p>
      <p data-testid="admin">{String(isAdmin)}</p>
      <p data-testid="email">{user?.email ?? 'none'}</p>
    </div>
  )
}

describe('AuthProvider', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('localStorage にユーザーがない場合は未認証状態で起動する', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('email')).toHaveTextContent('none')
  })

  it('localStorage にユーザーがある場合は認証済み状態で起動する', () => {
    const storedUser = { id: '1', name: 'テスト', email: 'test@example.com', role: 'member' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('email')).toHaveTextContent('test@example.com')
  })

  it('admin ロールのユーザーでは isAdmin が true になる', () => {
    const adminUser = { id: '2', name: '管理者', email: 'admin@example.com', role: 'admin' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('admin')).toHaveTextContent('true')
  })

  it('member ロールのユーザーでは isAdmin が false になる', () => {
    const memberUser = { id: '3', name: 'メンバー', email: 'member@example.com', role: 'member' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memberUser))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('admin')).toHaveTextContent('false')
  })

  it('localStorage の JSON が壊れている場合は未認証で起動する', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json')

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('children を表示する', () => {
    render(
      <AuthProvider>
        <p>子コンテンツ</p>
      </AuthProvider>,
    )
    expect(screen.getByText('子コンテンツ')).toBeInTheDocument()
  })

  it('localStorage に保存されたユーザーで起動するとストレージが正しく読まれる', () => {
    const user = { id: '1', name: 'テスト', email: 'test@example.com', role: 'member' as const }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('email')).toHaveTextContent('test@example.com')
  })
})
