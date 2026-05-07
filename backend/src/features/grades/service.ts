import { ConflictError, NotFoundError } from '../../shared/errors.js'
import type { GradeLetter } from '../../shared/types.js'
import { gradesRepository } from './repository.js'

type CreateGradeInput = {
  studentId: string
  studentName: string
  subject: string
  score: number
  year: number
  semester: 'spring' | 'fall'
}

export function scoreToLetter(score: number): GradeLetter {
  if (score >= 90) return 'S'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

export const gradesService = {
  getAll: async () => {
    return gradesRepository.findAll()
  },

  getById: async (id: string) => {
    const grade = await gradesRepository.findById(id)
    if (!grade) throw new NotFoundError('Grade not found')
    return grade
  },

  create: async (input: CreateGradeInput) => {
    const existing = await gradesRepository.findByStudentSubjectYearSemester(
      input.studentId,
      input.subject,
      input.year,
      input.semester,
    )
    if (existing) throw new ConflictError('Grade already exists for this student/subject/period')
    return gradesRepository.create({
      id: crypto.randomUUID(),
      ...input,
      letter: scoreToLetter(input.score),
    })
  },

  update: async (id: string, score: number) => {
    const grade = await gradesRepository.findById(id)
    if (!grade) throw new NotFoundError('Grade not found')
    return gradesRepository.update(id, { score, letter: scoreToLetter(score) })
  },

  delete: async (id: string) => {
    const grade = await gradesRepository.findById(id)
    if (!grade) throw new NotFoundError('Grade not found')
    await gradesRepository.delete(id)
  },
}
