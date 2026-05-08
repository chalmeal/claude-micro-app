import { type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '@/features/auth/hooks/authContext'

export const mockMemberUser = {
  id: '1',
  name: 'テストユーザー',
  email: 'member@example.com',
  role: 'member' as const,
}

export const mockAdminUser = {
  id: '2',
  name: '管理者',
  email: 'admin@example.com',
  role: 'admin' as const,
}

export function createMockAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: mockMemberUser,
    isAuthenticated: true,
    isAdmin: false,
    login: async () => {},
    logout: async () => {},
    changePassword: async () => {},
    ...overrides,
  }
}

type WrapperProps = {
  children: ReactNode
  authValue?: Partial<AuthContextValue>
  initialPath?: string
}

export function TestWrapper({ children, authValue, initialPath = '/' }: WrapperProps) {
  const value = createMockAuthValue(authValue)
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </MemoryRouter>
  )
}
