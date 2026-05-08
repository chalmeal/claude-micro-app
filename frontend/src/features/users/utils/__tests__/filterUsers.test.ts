import { filterUsers } from '../filterUsers'
import type { User, UserFilters } from '@/features/users/types'

const baseFilters: UserFilters = {
  keyword: '',
  role: '',
  status: '',
  dateFrom: '',
  dateTo: '',
}

const users: User[] = [
  { id: '1', name: '田中太郎', email: 'tanaka@example.com', role: 'admin', status: 'active', createdAt: '2024-01-10' },
  { id: '2', name: '鈴木花子', email: 'suzuki@example.com', role: 'member', status: 'active', createdAt: '2024-02-15' },
  { id: '3', name: '佐藤次郎', email: 'sato@example.com', role: 'member', status: 'inactive', createdAt: '2024-03-20' },
]

describe('filterUsers', () => {
  it('フィルターなしの場合は全ユーザーを返す', () => {
    expect(filterUsers(users, baseFilters)).toHaveLength(3)
  })

  describe('キーワードフィルター', () => {
    it('名前でフィルタリングする', () => {
      const result = filterUsers(users, { ...baseFilters, keyword: '田中' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('田中太郎')
    })

    it('メールアドレスでフィルタリングする', () => {
      const result = filterUsers(users, { ...baseFilters, keyword: 'suzuki' })
      expect(result).toHaveLength(1)
      expect(result[0].email).toBe('suzuki@example.com')
    })

    it('大文字小文字を区別しない', () => {
      const result = filterUsers(users, { ...baseFilters, keyword: 'TANAKA' })
      expect(result).toHaveLength(1)
    })

    it('前後の空白は無視する', () => {
      const result = filterUsers(users, { ...baseFilters, keyword: '  田中  ' })
      expect(result).toHaveLength(1)
    })

    it('一致するユーザーがいない場合は空配列を返す', () => {
      const result = filterUsers(users, { ...baseFilters, keyword: '存在しない' })
      expect(result).toHaveLength(0)
    })
  })

  describe('ロールフィルター', () => {
    it('admin でフィルタリングする', () => {
      const result = filterUsers(users, { ...baseFilters, role: 'admin' })
      expect(result).toHaveLength(1)
      expect(result[0].role).toBe('admin')
    })

    it('member でフィルタリングする', () => {
      const result = filterUsers(users, { ...baseFilters, role: 'member' })
      expect(result).toHaveLength(2)
      result.forEach((u) => expect(u.role).toBe('member'))
    })
  })

  describe('ステータスフィルター', () => {
    it('active でフィルタリングする', () => {
      const result = filterUsers(users, { ...baseFilters, status: 'active' })
      expect(result).toHaveLength(2)
      result.forEach((u) => expect(u.status).toBe('active'))
    })

    it('inactive でフィルタリングする', () => {
      const result = filterUsers(users, { ...baseFilters, status: 'inactive' })
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('inactive')
    })
  })

  describe('日付フィルター', () => {
    it('dateFrom 以降のユーザーを返す', () => {
      const result = filterUsers(users, { ...baseFilters, dateFrom: '2024-02-01' })
      expect(result).toHaveLength(2)
    })

    it('dateTo 以前のユーザーを返す', () => {
      const result = filterUsers(users, { ...baseFilters, dateTo: '2024-02-20' })
      expect(result).toHaveLength(2)
    })

    it('dateFrom と dateTo の範囲内のユーザーを返す', () => {
      const result = filterUsers(users, {
        ...baseFilters,
        dateFrom: '2024-02-01',
        dateTo: '2024-02-28',
      })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('鈴木花子')
    })
  })

  describe('複合フィルター', () => {
    it('キーワードとロールを同時に適用する', () => {
      const result = filterUsers(users, { ...baseFilters, keyword: 'example.com', role: 'member' })
      expect(result).toHaveLength(2)
    })

    it('ロールとステータスを同時に適用する', () => {
      const result = filterUsers(users, { ...baseFilters, role: 'member', status: 'inactive' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('佐藤次郎')
    })
  })
})
