import { apiFetch, setToken } from '@/shared/api/client'
import type { LoginCredentials, User } from '@/features/auth/types'

type LoginResponse = {
  token: string
  user: { id: string; name: string; email: string; role: 'admin' | 'member' }
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  setToken(res.token)
  return { id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role }
}

export async function logout(): Promise<void> {
  // no backend endpoint; token cleared by AuthProvider
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}
