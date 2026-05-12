import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SnackbarProvider } from '@/shared/components/Snackbar'

function renderWithSnackbar(ui: React.ReactElement) {
  return render(<SnackbarProvider>{ui}</SnackbarProvider>)
}

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
    renderWithSnackbar(
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

    renderWithSnackbar(
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

    renderWithSnackbar(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('admin')).toHaveTextContent('true')
  })

  it('member ロールのユーザーでは isAdmin が false になる', () => {
    const memberUser = { id: '3', name: 'メンバー', email: 'member@example.com', role: 'member' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memberUser))

    renderWithSnackbar(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('admin')).toHaveTextContent('false')
  })

  it('localStorage の JSON が壊れている場合は未認証で起動する', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json')

    renderWithSnackbar(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('children を表示する', () => {
    renderWithSnackbar(
      <AuthProvider>
        <p>子コンテンツ</p>
      </AuthProvider>,
    )
    expect(screen.getByText('子コンテンツ')).toBeInTheDocument()
  })

  it('localStorage に保存されたユーザーで起動するとストレージが正しく読まれる', () => {
    const user = { id: '1', name: 'テスト', email: 'test@example.com', role: 'member' as const }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))

    renderWithSnackbar(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('email')).toHaveTextContent('test@example.com')
  })
})
