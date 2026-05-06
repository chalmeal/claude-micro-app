import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '@/features/auth/api/login'
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/hooks/authContext'
import type { LoginCredentials, User } from '@/features/auth/types'

const STORAGE_KEY = 'claude-micro-app:auth-user'

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedInUser = await authApi.login(credentials)
    setUser(loggedInUser)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await authApi.changePassword(currentPassword, newPassword)
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      changePassword,
    }),
    [user, login, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
