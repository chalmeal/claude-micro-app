import { type CreateGradeInput, type Semester } from '@/features/grades/types'

export type ParseGradesResult = {
  rows: CreateGradeInput[]
  errors: string[]
}

const REQUIRED_HEADERS = ['studentname', 'subject', 'score', 'year', 'semester']

function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result.map((c) => c.trim())
}

export function parseGradesCsv(text: string): ParseGradesResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)

  if (lines.length === 0) {
    return { rows: [], errors: ['CSV が空です'] }
  }

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase())
  const headerErrors: string[] = []
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      headerErrors.push(`ヘッダーに "${required}" 列が必要です`)
    }
  }
  if (headerErrors.length > 0) {
    return { rows: [], errors: headerErrors }
  }

  const idx = {
    studentName: headers.indexOf('studentname'),
    subject: headers.indexOf('subject'),
    score: headers.indexOf('score'),
    year: headers.indexOf('year'),
    semester: headers.indexOf('semester'),
  }

  const rows: CreateGradeInput[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    const lineNo = i + 1

    const studentName = cols[idx.studentName] ?? ''
    if (!studentName) {
      errors.push(`${lineNo} 行目: studentname が空です`)
      continue
    }

    const subject = cols[idx.subject] ?? ''
    if (!subject) {
      errors.push(`${lineNo} 行目: subject が空です`)
      continue
    }

    const scoreRaw = cols[idx.score] ?? ''
    const score = parseInt(scoreRaw, 10)
    if (isNaN(score) || score < 0 || score > 100) {
      errors.push(`${lineNo} 行目: score は 0〜100 の整数を指定してください (現在: "${scoreRaw}")`)
      continue
    }

    const yearRaw = cols[idx.year] ?? ''
    const year = parseInt(yearRaw, 10)
    if (isNaN(year) || year < 2000 || year > 2100) {
      errors.push(`${lineNo} 行目: year は有効な年度を指定してください (現在: "${yearRaw}")`)
      continue
    }

    const semesterRaw = cols[idx.semester] ?? ''
    if (semesterRaw !== 'spring' && semesterRaw !== 'fall') {
      errors.push(
        `${lineNo} 行目: semester は spring / fall のいずれかを指定してください (現在: "${semesterRaw}")`,
      )
      continue
    }

    rows.push({
      studentName,
      subject,
      score,
      year,
      semester: semesterRaw as Semester,
    })
  }

  return { rows, errors }
}
