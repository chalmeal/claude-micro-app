import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '@/features/auth/hooks/authContext'
import { ProtectedRoute } from '../ProtectedRoute'
import { createMockAuthValue } from '@/__tests__/testHelpers'

function setup(isAuthenticated: boolean, initialPath = '/protected') {
  const authValue = createMockAuthValue({ isAuthenticated, user: isAuthenticated ? createMockAuthValue().user : null })
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route path="/login" element={<p>ログインページ</p>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <p>保護されたページ</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('認証済みの場合は children を表示する', () => {
    setup(true)
    expect(screen.getByText('保護されたページ')).toBeInTheDocument()
  })

  it('未認証の場合は /login にリダイレクトする', () => {
    setup(false)
    expect(screen.getByText('ログインページ')).toBeInTheDocument()
    expect(screen.queryByText('保護されたページ')).not.toBeInTheDocument()
  })
})
