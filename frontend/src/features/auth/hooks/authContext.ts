import { createContext } from 'react'
import type { LoginCredentials, User } from '@/features/auth/types'

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
