import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Grade, GradeLetter, Semester } from '@/features/grades/types'

type Props = {
  grades: Grade[]
}

const semesterLabel: Record<Semester, string> = {
  spring: '前期',
  fall: '後期',
}

const letterColors: Record<GradeLetter, string> = {
  S: 'grade-badge--s',
  A: 'grade-badge--a',
  B: 'grade-badge--b',
  C: 'grade-badge--c',
  D: 'grade-badge--d',
  F: 'grade-badge--f',
}

export function GradeList({ grades }: Props) {
  const navigate = useNavigate()

  function handleRowKeyDown(e: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(`/grades/${id}`)
    }
  }

  if (grades.length === 0) {
    return <p className="grade-list__empty">該当する成績データがありません</p>
  }

  return (
    <div className="grade-list">
      <table className="grade-list__table">
        <thead>
          <tr>
            <th>学生名</th>
            <th>科目</th>
            <th>点数</th>
            <th>評価</th>
            <th>年度</th>
            <th>学期</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => (
            <tr
              key={grade.id}
              className="grade-list__row grade-list__row--clickable"
              tabIndex={0}
              aria-label={`${grade.studentName} ${grade.subject} の詳細を表示`}
              onClick={() => navigate(`/grades/${grade.id}`)}
              onKeyDown={(e) => handleRowKeyDown(e, grade.id)}
            >
              <td data-label="学生名">{grade.studentName}</td>
              <td data-label="科目">{grade.subject}</td>
              <td data-label="点数" className="grade-list__score">
                {grade.score}
              </td>
              <td data-label="評価">
                <span className={`grade-badge ${letterColors[grade.letter]}`}>{grade.letter}</span>
              </td>
              <td data-label="年度" className="grade-list__year">
                {grade.year}
              </td>
              <td data-label="学期">{semesterLabel[grade.semester]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
