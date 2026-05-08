import { jest } from '@jest/globals'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/features/auth/hooks/authContext'
import { LoginForm } from '../LoginForm'
import { createMockAuthValue } from '@/__tests__/testHelpers'

function renderLoginForm(loginImpl?: () => Promise<void>) {
  const login = loginImpl
    ? jest.fn<() => Promise<void>>().mockImplementation(loginImpl)
    : jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
  const onSuccess = jest.fn()
  const authValue = createMockAuthValue({ login })

  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <LoginForm onSuccess={onSuccess} />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
  return { login, onSuccess }
}

describe('LoginForm', () => {
  it('メールアドレスとパスワードのフィールドを表示する', () => {
    renderLoginForm()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
  })

  it('ログインボタンを表示する', () => {
    renderLoginForm()
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('パスワードを忘れた方へのリンクを表示する', () => {
    renderLoginForm()
    expect(screen.getByRole('link', { name: 'パスワードを忘れた方はこちら' })).toBeInTheDocument()
  })

  it('フォームに入力してサブミットすると login が呼ばれる', async () => {
    const { login } = renderLoginForm()
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('ログイン成功後に onSuccess が呼ばれる', async () => {
    const { onSuccess } = renderLoginForm()
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('サブミット中はボタンが無効化される', async () => {
    let resolveLogin!: () => void
    const pendingLogin = new Promise<void>((resolve) => { resolveLogin = resolve })
    renderLoginForm(() => pendingLogin)

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled()
    await act(async () => { resolveLogin() })
  })

  it('認証エラーのとき日本語エラーメッセージを表示する', async () => {
    renderLoginForm(() => Promise.reject(new Error('Invalid email or password')))

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'wrong@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'メールアドレスまたはパスワードに誤りがあります。',
      )
    })
  })

  it('その他のエラーのときはデフォルトエラーメッセージを表示する', async () => {
    renderLoginForm(() => Promise.reject(new Error('Network error')))

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ログインに失敗しました')
    })
  })
})
