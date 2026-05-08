import { parseGradesCsv } from '../parseGradesCsv'

describe('parseGradesCsv', () => {
  describe('空・ヘッダーエラー', () => {
    it('空文字列の場合はエラーを返す', () => {
      const result = parseGradesCsv('')
      expect(result.rows).toHaveLength(0)
      expect(result.errors).toContain('CSV が空です')
    })

    it('必須ヘッダーが欠けている場合はエラーを返す', () => {
      const csv = 'studentname,subject,score,year\n田中,数学,80,2024'
      const result = parseGradesCsv(csv)
      expect(result.rows).toHaveLength(0)
      expect(result.errors).toContain('ヘッダーに "semester" 列が必要です')
    })
  })

  describe('正常系', () => {
    it('正しい CSV を正常にパースする', () => {
      const csv = 'studentname,subject,score,year,semester\n田中,数学,80,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.errors).toHaveLength(0)
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0]).toEqual({
        studentName: '田中',
        subject: '数学',
        score: 80,
        year: 2024,
        semester: 'spring',
      })
    })

    it('複数行をパースする', () => {
      const csv = [
        'studentname,subject,score,year,semester',
        '田中,数学,80,2024,spring',
        '鈴木,英語,90,2024,fall',
      ].join('\n')
      const result = parseGradesCsv(csv)
      expect(result.rows).toHaveLength(2)
      expect(result.errors).toHaveLength(0)
    })

    it('CRLF 改行を正しく処理する', () => {
      const csv = 'studentname,subject,score,year,semester\r\n田中,数学,80,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.rows).toHaveLength(1)
    })

    it('ダブルクォートで囲まれたフィールドをパースする', () => {
      const csv = 'studentname,subject,score,year,semester\n"田中,太郎",数学,80,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.rows[0].studentName).toBe('田中,太郎')
    })

    it('ダブルクォートのエスケープ（""）を処理する', () => {
      const csv = 'studentname,subject,score,year,semester\n"田中""太郎",数学,80,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.rows[0].studentName).toBe('田中"太郎')
    })
  })

  describe('バリデーションエラー', () => {
    it('score が 100 超の場合はエラーを返す', () => {
      const csv = 'studentname,subject,score,year,semester\n田中,数学,101,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('score')
    })

    it('score が負数の場合はエラーを返す', () => {
      const csv = 'studentname,subject,score,year,semester\n田中,数学,-1,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.errors[0]).toContain('score')
    })

    it('semester が spring/fall 以外の場合はエラーを返す', () => {
      const csv = 'studentname,subject,score,year,semester\n田中,数学,80,2024,summer'
      const result = parseGradesCsv(csv)
      expect(result.errors[0]).toContain('semester')
    })

    it('studentname が空の場合はエラーを返す', () => {
      const csv = 'studentname,subject,score,year,semester\n,数学,80,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.errors[0]).toContain('studentname')
    })

    it('subject が空の場合はエラーを返す', () => {
      const csv = 'studentname,subject,score,year,semester\n田中,,80,2024,spring'
      const result = parseGradesCsv(csv)
      expect(result.errors[0]).toContain('subject')
    })

    it('エラー行はスキップして有効な行のみ返す', () => {
      const csv = [
        'studentname,subject,score,year,semester',
        '田中,数学,80,2024,spring',
        '鈴木,英語,999,2024,fall',
        '佐藤,理科,70,2024,fall',
      ].join('\n')
      const result = parseGradesCsv(csv)
      expect(result.rows).toHaveLength(2)
      expect(result.errors).toHaveLength(1)
    })
  })
})
