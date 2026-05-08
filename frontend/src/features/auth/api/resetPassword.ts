import { apiFetch } from '@/shared/api/client'

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/auth/reset-password/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  await apiFetch('/auth/reset-password/confirm', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}
