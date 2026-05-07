import type { CreateUserInput } from '@/features/users/types'

export type ParseResult = {
  rows: CreateUserInput[]
  errors: string[]
}

const REQUIRED_HEADERS = ['name', 'email', 'role', 'status']

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

export function parseUsersCsv(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l)
    .filter((l) => l.trim().length > 0)

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
    name: headers.indexOf('name'),
    email: headers.indexOf('email'),
    role: headers.indexOf('role'),
    status: headers.indexOf('status'),
  }

  const rows: CreateUserInput[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i])
    const lineNo = i + 1
    const role = cols[idx.role]
    const status = cols[idx.status]

    if (role !== 'admin' && role !== 'member') {
      errors.push(
        `${lineNo} 行目: role は admin / member のいずれかを指定してください (現在: "${role ?? ''}")`,
      )
      continue
    }
    if (status !== 'active' && status !== 'inactive') {
      errors.push(
        `${lineNo} 行目: status は active / inactive のいずれかを指定してください (現在: "${status ?? ''}")`,
      )
      continue
    }

    rows.push({
      name: cols[idx.name] ?? '',
      email: cols[idx.email] ?? '',
      role,
      status,
    })
  }

  return { rows, errors }
}
