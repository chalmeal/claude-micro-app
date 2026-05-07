export type UserRole = 'admin' | 'member'

export type User = {
  id: string
  name: string
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
