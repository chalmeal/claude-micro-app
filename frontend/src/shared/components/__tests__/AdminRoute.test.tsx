import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '@/features/auth/hooks/authContext'
import { AdminRoute } from '../AdminRoute'
import { createMockAuthValue, mockAdminUser, mockMemberUser } from '@/__tests__/testHelpers'

function setup(opts: { isAuthenticated: boolean; isAdmin: boolean }, initialPath = '/admin') {
  const authValue = createMockAuthValue({
    isAuthenticated: opts.isAuthenticated,
    isAdmin: opts.isAdmin,
    user: opts.isAuthenticated ? (opts.isAdmin ? mockAdminUser : mockMemberUser) : null,
  })
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route path="/login" element={<p>ログインページ</p>} />
          <Route path="/" element={<p>トップページ</p>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <p>管理者ページ</p>
              </AdminRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  it('管理者ユーザーの場合は children を表示する', () => {
    setup({ isAuthenticated: true, isAdmin: true })
    expect(screen.getByText('管理者ページ')).toBeInTheDocument()
  })

  it('未認証の場合は /login にリダイレクトする', () => {
    setup({ isAuthenticated: false, isAdmin: false })
    expect(screen.getByText('ログインページ')).toBeInTheDocument()
    expect(screen.queryByText('管理者ページ')).not.toBeInTheDocument()
  })

  it('認証済みだが一般ユーザーの場合は / にリダイレクトする', () => {
    setup({ isAuthenticated: true, isAdmin: false })
    expect(screen.getByText('トップページ')).toBeInTheDocument()
    expect(screen.queryByText('管理者ページ')).not.toBeInTheDocument()
  })
})
