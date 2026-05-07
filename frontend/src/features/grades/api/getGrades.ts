import { apiFetch, isAbortError } from '@/shared/api/client'
import { scoreToLetter, type CreateGradeInput, type Grade } from '@/features/grades/types'

const SUBJECTS = [
  '数学I',
  '数学II',
  '英語',
  '国語',
  '物理',
  '化学',
  '生物',
  '歴史',
  '経済学',
  'プログラミング入門',
  'データ構造',
  'アルゴリズム論',
  '線形代数',
  '統計学',
  '情報倫理',
]

type ApiGrade = {
  id: string
  studentId: string
  studentName: string
  subject: string
  score: number
  letter: Grade['letter']
  year: number
  semester: Grade['semester']
  createdAt: string
  updatedAt: string
}

function toGrade(g: ApiGrade): Grade {
  return {
    id: g.id,
    studentId: g.studentId,
    studentName: g.studentName,
    subject: g.subject,
    score: g.score,
    letter: g.letter,
    year: g.year,
    semester: g.semester,
  }
}

export async function getGrades(signal?: AbortSignal): Promise<Grade[]> {
  const data = await apiFetch<ApiGrade[]>('/grades', { signal })
  return data.map(toGrade)
}

export async function getGradeById(id: string, signal?: AbortSignal): Promise<Grade | null> {
  try {
    return toGrade(await apiFetch<ApiGrade>(`/grades/${id}`, { signal }))
  } catch (err) {
    if (isAbortError(err)) throw err
    return null
  }
}

export async function getGradesByStudentAndSubject(
  studentId: string,
  subject: string,
  signal?: AbortSignal,
): Promise<Grade[]> {
  const all = await getGrades(signal)
  return all
    .filter((g) => g.studentId === studentId && g.subject === subject)
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return a.semester === 'fall' ? -1 : 1
    })
}

export async function deleteGrade(id: string): Promise<void> {
  await apiFetch(`/grades/${id}`, { method: 'DELETE' })
}

export async function updateGrade(id: string, score: number): Promise<Grade> {
  return toGrade(
    await apiFetch<ApiGrade>(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ score }),
    }),
  )
}

export function getSubjects(): string[] {
  return [...SUBJECTS]
}

export function getStudentNames(): { id: string; name: string }[] {
  return []
}

export async function createGrade(input: CreateGradeInput): Promise<Grade> {
  const existing = await getGrades()
  const match = existing.find((g) => g.studentName === input.studentName.trim())
  const studentId = match?.studentId ?? crypto.randomUUID()

  return toGrade(
    await apiFetch<ApiGrade>('/grades', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        studentName: input.studentName.trim(),
        subject: input.subject,
        score: input.score,
        year: input.year,
        semester: input.semester,
      }),
    }),
  )
}

export async function createGrades(inputs: CreateGradeInput[]): Promise<Grade[]> {
  if (inputs.length === 0) throw new Error('登録する行がありません')

  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].studentName.trim()) {
      throw new Error(`${i + 1} 行目: 学生名が入力されていません`)
    }
  }

  const existing = await getGrades()
  const studentIdMap = new Map<string, string>()
  for (const g of existing) {
    if (!studentIdMap.has(g.studentName)) studentIdMap.set(g.studentName, g.studentId)
  }

  const results: Grade[] = []
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const name = input.studentName.trim()
    const studentId = studentIdMap.get(name) ?? (() => {
      const id = crypto.randomUUID()
      studentIdMap.set(name, id)
      return id
    })()

    try {
      const grade = toGrade(
        await apiFetch<ApiGrade>('/grades', {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            studentName: name,
            subject: input.subject,
            score: input.score,
            year: input.year,
            semester: input.semester,
          }),
        }),
      )
      results.push(grade)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`${i + 1} 行目: ${msg}`, { cause: err })
    }
  }

  return results
}

// re-export for existing consumers
export { scoreToLetter }
