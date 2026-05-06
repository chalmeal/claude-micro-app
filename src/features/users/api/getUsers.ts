import type {
  CreateUserInput,
  UpdateUserPatch,
  User,
} from '@/features/users/types'

const FAMILY_NAMES = [
  '田中', '鈴木', '佐藤', '高橋', '山田', '伊藤', '渡辺', '中村',
  '小林', '加藤', '吉田', '山本', '松本', '井上', '木村', '林',
]

const GIVEN_NAMES = [
  '太郎', '花子', '次郎', '三郎', '美咲', '健', '由美', '大輔',
  'さくら', '翔', '美穂', '亮', '結衣', '優', '智子', '健太',
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

let MOCK_USERS: User[] = Array.from({ length: 80 }, (_, i): User => {
  const idx = i + 1
  const family = FAMILY_NAMES[i % FAMILY_NAMES.length]
  const given = GIVEN_NAMES[(i * 3) % GIVEN_NAMES.length]
  const month = ((i * 5) % 12) + 1
  const day = ((i * 11) % 28) + 1
  return {
    id: String(idx),
    name: `${family} ${given}`,
    email: `user${idx}@example.com`,
    role: idx % 5 === 0 ? 'admin' : 'member',
    status: idx % 8 === 0 ? 'inactive' : 'active',
    createdAt: `2024-${pad(month)}-${pad(day)}`,
  }
})

export async function getUsers(): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_USERS
}

export async function getUserById(id: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_USERS.find((u) => u.id === id) ?? null
}

export async function updateUser(
  id: string,
  patch: UpdateUserPatch,
): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const target = MOCK_USERS.find((u) => u.id === id)
  if (!target) {
    throw new Error('ユーザーが見つかりません')
  }
  const updated: User = { ...target, ...patch }
  MOCK_USERS = MOCK_USERS.map((u) => (u.id === id ? updated : u))
  return updated
}

export async function createUser(input: CreateUserInput): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (MOCK_USERS.some((u) => u.email === input.email)) {
    throw new Error('このメールアドレスは既に使用されています')
  }

  const nextId =
    MOCK_USERS.reduce((max, u) => Math.max(max, Number(u.id)), 0) + 1
  const today = new Date().toISOString().slice(0, 10)

  const newUser: User = {
    id: String(nextId),
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    status: input.status,
    createdAt: today,
  }

  MOCK_USERS = [newUser, ...MOCK_USERS]
  return newUser
}

export async function createUsers(inputs: CreateUserInput[]): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  if (inputs.length === 0) {
    throw new Error('登録する行がありません')
  }

  const seen = new Set<string>()
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const rowLabel = `${i + 1} 行目`
    if (!input.name.trim()) {
      throw new Error(`${rowLabel}: 名前が入力されていません`)
    }
    if (!input.email.trim()) {
      throw new Error(`${rowLabel}: メールアドレスが入力されていません`)
    }
    if (seen.has(input.email)) {
      throw new Error(
        `${rowLabel}: メールアドレス ${input.email} が入力内で重複しています`,
      )
    }
    seen.add(input.email)
    if (MOCK_USERS.some((u) => u.email === input.email)) {
      throw new Error(
        `${rowLabel}: メールアドレス ${input.email} は既に使用されています`,
      )
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  let nextId =
    MOCK_USERS.reduce((max, u) => Math.max(max, Number(u.id)), 0) + 1

  const newUsers: User[] = inputs.map((input) => ({
    id: String(nextId++),
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    status: input.status,
    createdAt: today,
  }))

  MOCK_USERS = [...newUsers, ...MOCK_USERS]
  return newUsers
}
