import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./repository.js')

import * as repo from './repository.js'
import { gradesService, scoreToLetter } from './service.js'

const mockGrade = {
  id: 'grade-1',
  studentId: 'student-1',
  studentName: 'Alice',
  subject: 'Math',
  score: 85,
  letter: 'A' as const,
  year: 2025,
  semester: 'spring' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('scoreToLetter', () => {
  it.each([
    [100, 'S'],
    [90, 'S'],
    [89, 'A'],
    [80, 'A'],
    [79, 'B'],
    [70, 'B'],
    [69, 'C'],
    [60, 'C'],
    [59, 'D'],
    [50, 'D'],
    [49, 'F'],
    [0, 'F'],
  ])('score %i → %s', (score, expected) => {
    expect(scoreToLetter(score)).toBe(expected)
  })
})

describe('gradesService.create', () => {
  beforeEach(() => vi.clearAllMocks())

  it('成績を作成し letter を自動計算する', async () => {
    vi.mocked(repo.gradesRepository.findByStudentSubjectYearSemester).mockResolvedValue(undefined)
    vi.mocked(repo.gradesRepository.create).mockResolvedValue(mockGrade)

    await gradesService.create({
      studentId: 'student-1',
      studentName: 'Alice',
      subject: 'Math',
      score: 85,
      year: 2025,
      semester: 'spring',
    })

    expect(repo.gradesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ score: 85, letter: 'A' }),
    )
  })

  it('同一期間の重複 → ConflictError', async () => {
    vi.mocked(repo.gradesRepository.findByStudentSubjectYearSemester).mockResolvedValue(mockGrade)

    await expect(
      gradesService.create({
        studentId: 'student-1',
        studentName: 'Alice',
        subject: 'Math',
        score: 70,
        year: 2025,
        semester: 'spring',
      }),
    ).rejects.toThrow('Grade already exists')
  })
})

describe('gradesService.update', () => {
  it('score 更新時に letter を再計算する', async () => {
    vi.mocked(repo.gradesRepository.findById).mockResolvedValue(mockGrade)
    vi.mocked(repo.gradesRepository.update).mockResolvedValue({ ...mockGrade, score: 55, letter: 'D' })

    const result = await gradesService.update('grade-1', 55)

    expect(repo.gradesRepository.update).toHaveBeenCalledWith('grade-1', { score: 55, letter: 'D' })
    expect(result?.letter).toBe('D')
  })

  it('存在しない ID → NotFoundError', async () => {
    vi.mocked(repo.gradesRepository.findById).mockResolvedValue(undefined)

    await expect(gradesService.update('no-id', 80)).rejects.toThrow('Grade not found')
  })
})
