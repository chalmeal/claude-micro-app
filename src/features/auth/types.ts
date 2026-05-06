export type UserRole = 'admin' | 'user'

export type User = {
  id: string
  email: string
  role: UserRole
}

export type LoginCredentials = {
  email: string
  password: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
}
