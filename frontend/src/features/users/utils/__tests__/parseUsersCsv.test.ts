import { parseUsersCsv } from '../parseUsersCsv'

describe('parseUsersCsv', () => {
  describe('空・ヘッダーエラー', () => {
    it('空文字列の場合はエラーを返す', () => {
      const result = parseUsersCsv('')
      expect(result.rows).toHaveLength(0)
      expect(result.errors).toContain('CSV が空です')
    })

    it('必須ヘッダー name が欠けている場合はエラーを返す', () => {
      const csv = 'email,role,status\ntest@example.com,admin,active'
      const result = parseUsersCsv(csv)
      expect(result.errors).toContain('ヘッダーに "name" 列が必要です')
      expect(result.rows).toHaveLength(0)
    })

    it('複数のヘッダーが欠けている場合はすべてのエラーを返す', () => {
      const csv = 'name\n田中'
      const result = parseUsersCsv(csv)
      expect(result.errors).toContain('ヘッダーに "email" 列が必要です')
      expect(result.errors).toContain('ヘッダーに "role" 列が必要です')
      expect(result.errors).toContain('ヘッダーに "status" 列が必要です')
    })
  })

  describe('正常系', () => {
    it('正しい CSV を正常にパースする', () => {
      const csv = 'name,email,role,status\n田中太郎,tanaka@example.com,admin,active'
      const result = parseUsersCsv(csv)
      expect(result.errors).toHaveLength(0)
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0]).toEqual({
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'admin',
        status: 'active',
      })
    })

    it('複数行をパースする', () => {
      const csv = [
        'name,email,role,status',
        '田中,tanaka@example.com,admin,active',
        '鈴木,suzuki@example.com,member,inactive',
      ].join('\n')
      const result = parseUsersCsv(csv)
      expect(result.rows).toHaveLength(2)
      expect(result.errors).toHaveLength(0)
    })

    it('ヘッダーの大文字小文字を区別しない', () => {
      const csv = 'Name,Email,Role,Status\n田中,tanaka@example.com,member,active'
      const result = parseUsersCsv(csv)
      expect(result.errors).toHaveLength(0)
      expect(result.rows).toHaveLength(1)
    })

    it('CRLF 改行を正しく処理する', () => {
      const csv = 'name,email,role,status\r\n田中,tanaka@example.com,member,active'
      const result = parseUsersCsv(csv)
      expect(result.rows).toHaveLength(1)
    })

    it('ダブルクォートで囲まれたフィールドをパースする', () => {
      const csv = 'name,email,role,status\n"田中,太郎",tanaka@example.com,member,active'
      const result = parseUsersCsv(csv)
      expect(result.rows[0].name).toBe('田中,太郎')
    })

    it('空行をスキップする', () => {
      const csv = 'name,email,role,status\n田中,tanaka@example.com,member,active\n\n'
      const result = parseUsersCsv(csv)
      expect(result.rows).toHaveLength(1)
    })
  })

  describe('バリデーションエラー', () => {
    it('role が admin/member 以外の場合はエラーを返す', () => {
      const csv = 'name,email,role,status\n田中,tanaka@example.com,superadmin,active'
      const result = parseUsersCsv(csv)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('role')
    })

    it('status が active/inactive 以外の場合はエラーを返す', () => {
      const csv = 'name,email,role,status\n田中,tanaka@example.com,member,enabled'
      const result = parseUsersCsv(csv)
      expect(result.errors[0]).toContain('status')
    })

    it('エラー行はスキップして有効な行のみ返す', () => {
      const csv = [
        'name,email,role,status',
        '田中,tanaka@example.com,member,active',
        '鈴木,suzuki@example.com,invalid,active',
        '佐藤,sato@example.com,member,inactive',
      ].join('\n')
      const result = parseUsersCsv(csv)
      expect(result.rows).toHaveLength(2)
      expect(result.errors).toHaveLength(1)
    })
  })
})
