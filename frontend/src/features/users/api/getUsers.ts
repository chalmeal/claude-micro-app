import { apiFetch, isAbortError } from '@/shared/api/client'
import type { CreateUserInput, UpdateUserPatch, User } from '@/features/users/types'

type ApiUser = {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'member'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

function toUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.slice(0, 10),
  }
}

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const data = await apiFetch<ApiUser[]>('/users', { signal })
  return data.map(toUser)
}

export async function getUserById(id: string, signal?: AbortSignal): Promise<User | null> {
  try {
    return toUser(await apiFetch<ApiUser>(`/users/${id}`, { signal }))
  } catch (err) {
    if (isAbortError(err)) throw err
    return null
  }
}

export async function updateUser(id: string, patch: UpdateUserPatch): Promise<User> {
  return toUser(
    await apiFetch<ApiUser>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  )
}

function generateTemporaryPassword(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return toUser(
    await apiFetch<ApiUser>('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email.trim(),
        role: input.role,
        temporaryPassword: generateTemporaryPassword(),
      }),
    }),
  )
}

export async function createUsers(inputs: CreateUserInput[]): Promise<User[]> {
  if (inputs.length === 0) throw new Error('登録する行がありません')

  const seen = new Set<string>()
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const rowLabel = `${i + 1} 行目`
    if (!input.name.trim()) throw new Error(`${rowLabel}: 名前が入力されていません`)
    if (!input.email.trim()) throw new Error(`${rowLabel}: メールアドレスが入力されていません`)
    if (seen.has(input.email)) {
      throw new Error(`${rowLabel}: メールアドレス ${input.email} が入力内で重複しています`)
    }
    seen.add(input.email)
  }

  const results: User[] = []
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    try {
      const user = toUser(
        await apiFetch<ApiUser>('/users', {
          method: 'POST',
          body: JSON.stringify({
            name: input.name.trim(),
            email: input.email.trim(),
            role: input.role,
            temporaryPassword: generateTemporaryPassword(),
          }),
        }),
      )
      results.push(user)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`${i + 1} 行目: ${msg}`, { cause: err })
    }
  }

  return results
}
