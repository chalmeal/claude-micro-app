export type User = {
  id: string
  email: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
}
