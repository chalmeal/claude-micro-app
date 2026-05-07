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

const STUDENT_NAMES = [
  '田中 太郎',
  '鈴木 花子',
  '佐藤 次郎',
  '高橋 美咲',
  '山田 健',
  '伊藤 由美',
  '渡辺 大輔',
  '中村 さくら',
  '小林 翔',
  '加藤 美穂',
  '吉田 亮',
  '山本 結衣',
  '松本 優',
  '井上 智子',
  '木村 健太',
  '林 奈々',
  '清水 浩',
  '池田 麻衣',
  '橋本 拓也',
  '石田 愛',
]

const YEARS = [2023, 2024] as const
const SEMESTERS = ['spring', 'fall'] as const

function deterministicScore(seed: number): number {
  return ((seed * 137 + 31) % 60) + 40
}

const MOCK_GRADES: Grade[] = Array.from(
  { length: STUDENT_NAMES.length * SUBJECTS.length * YEARS.length * SEMESTERS.length },
  (_, i): Grade => {
    const studentIdx = Math.floor(i / (SUBJECTS.length * YEARS.length * SEMESTERS.length))
    const rem1 = i % (SUBJECTS.length * YEARS.length * SEMESTERS.length)
    const subjectIdx = Math.floor(rem1 / (YEARS.length * SEMESTERS.length))
    const rem2 = rem1 % (YEARS.length * SEMESTERS.length)
    const yearIdx = Math.floor(rem2 / SEMESTERS.length)
    const semesterIdx = rem2 % SEMESTERS.length

    const score = deterministicScore(i * 17 + studentIdx * 3 + subjectIdx)
    return {
      id: String(i + 1),
      studentId: String(studentIdx + 1),
      studentName: STUDENT_NAMES[studentIdx],
      subject: SUBJECTS[subjectIdx],
      score,
      letter: scoreToLetter(score),
      year: YEARS[yearIdx],
      semester: SEMESTERS[semesterIdx],
    }
  },
)

export async function getGrades(): Promise<Grade[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_GRADES
}

export async function getGradeById(id: string): Promise<Grade | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_GRADES.find((g) => g.id === id) ?? null
}

// 同学生×同科目の全学期を新しい順（後期 → 前期）で返す
export async function getGradesByStudentAndSubject(
  studentId: string,
  subject: string,
): Promise<Grade[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_GRADES.filter((g) => g.studentId === studentId && g.subject === subject).sort(
    (a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return a.semester === 'fall' ? -1 : 1
    },
  )
}

export async function deleteGrade(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = MOCK_GRADES.findIndex((g) => g.id === id)
  if (index === -1) throw new Error('成績データが見つかりません')
  MOCK_GRADES.splice(index, 1)
}

export async function updateGrade(id: string, score: number): Promise<Grade> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const index = MOCK_GRADES.findIndex((g) => g.id === id)
  if (index === -1) throw new Error('成績データが見つかりません')
  const updated: Grade = { ...MOCK_GRADES[index], score, letter: scoreToLetter(score) }
  MOCK_GRADES[index] = updated
  return updated
}

export function getSubjects(): string[] {
  return [...SUBJECTS]
}

export function getStudentNames(): { id: string; name: string }[] {
  return STUDENT_NAMES.map((name, i) => ({ id: String(i + 1), name }))
}

export async function createGrade(input: CreateGradeInput): Promise<Grade> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const existing = MOCK_GRADES.find(
    (g) =>
      g.studentName === input.studentName.trim() &&
      g.subject === input.subject &&
      g.year === input.year &&
      g.semester === input.semester,
  )
  if (existing) {
    throw new Error(
      `${input.studentName} の ${input.subject} (${input.year}年度 ${input.semester === 'spring' ? '前期' : '後期'}) は既に登録されています`,
    )
  }

  const studentEntry = STUDENT_NAMES.map((name, i) => ({ id: String(i + 1), name })).find(
    (s) => s.name === input.studentName.trim(),
  )

  const studentId =
    studentEntry?.id ??
    String(Math.max(...MOCK_GRADES.map((g) => Number(g.studentId)), STUDENT_NAMES.length) + 1)

  const nextId = String(MOCK_GRADES.reduce((max, g) => Math.max(max, Number(g.id)), 0) + 1)
  const score = input.score
  const newGrade: Grade = {
    id: nextId,
    studentId,
    studentName: input.studentName.trim(),
    subject: input.subject,
    score,
    letter: scoreToLetter(score),
    year: input.year,
    semester: input.semester,
  }
  MOCK_GRADES.push(newGrade)
  return newGrade
}

export async function createGrades(inputs: CreateGradeInput[]): Promise<Grade[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  if (inputs.length === 0) {
    throw new Error('登録する行がありません')
  }

  const results: Grade[] = []
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const rowLabel = `${i + 1} 行目`

    if (!input.studentName.trim()) {
      throw new Error(`${rowLabel}: 学生名が入力されていません`)
    }

    const existing = MOCK_GRADES.find(
      (g) =>
        g.studentName === input.studentName.trim() &&
        g.subject === input.subject &&
        g.year === input.year &&
        g.semester === input.semester,
    )
    if (existing) {
      throw new Error(
        `${rowLabel}: ${input.studentName} の ${input.subject} (${input.year}年度 ${input.semester === 'spring' ? '前期' : '後期'}) は既に登録されています`,
      )
    }
  }

  for (const input of inputs) {
    const studentEntry = STUDENT_NAMES.map((name, idx) => ({ id: String(idx + 1), name })).find(
      (s) => s.name === input.studentName.trim(),
    )

    const studentId =
      studentEntry?.id ??
      String(Math.max(...MOCK_GRADES.map((g) => Number(g.studentId)), STUDENT_NAMES.length) + 1)

    const nextId = String(MOCK_GRADES.reduce((max, g) => Math.max(max, Number(g.id)), 0) + 1)
    const score = input.score
    const newGrade: Grade = {
      id: nextId,
      studentId,
      studentName: input.studentName.trim(),
      subject: input.subject,
      score,
      letter: scoreToLetter(score),
      year: input.year,
      semester: input.semester,
    }
    MOCK_GRADES.push(newGrade)
    results.push(newGrade)
  }

  return results
}
