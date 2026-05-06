export type GradeLetter = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export type Semester = 'spring' | 'fall'

export type Grade = {
  id: string
  studentId: string
  studentName: string
  subject: string
  score: number
  letter: GradeLetter
  year: number
  semester: Semester
}

export type GradeFilters = {
  keyword: string
  subject: string
  semester: Semester | ''
  year: string
  letter: GradeLetter | ''
}

export const emptyGradeFilters: GradeFilters = {
  keyword: '',
  subject: '',
  semester: '',
  year: '',
  letter: '',
}

export type CreateGradeInput = {
  studentName: string
  subject: string
  score: number
  year: number
  semester: Semester
}

export function scoreToLetter(score: number): GradeLetter {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}
