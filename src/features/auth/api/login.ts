import type { LoginCredentials, User } from '@/features/auth/types'

export async function login(credentials: LoginCredentials): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!credentials.email || !credentials.password) {
    throw new Error('メールアドレスとパスワードを入力してください')
  }

  if (credentials.password.length < 4) {
    throw new Error('パスワードは4文字以上で入力してください')
  }

  return {
    id: crypto.randomUUID(),
    email: credentials.email,
  }
}

export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  if (currentPassword.length < 4) {
    throw new Error('現在のパスワードが正しくありません')
  }
  if (newPassword.length < 8) {
    throw new Error('新しいパスワードは8文字以上で入力してください')
  }
}
