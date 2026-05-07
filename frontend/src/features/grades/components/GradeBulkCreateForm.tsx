import { useState, type FormEvent } from 'react'
import { getStudentNames, getSubjects } from '@/features/grades/api/getGrades'
import { type CreateGradeInput, type Semester } from '@/features/grades/types'

type BulkRow = { _key: string; studentName: string; scoreInput: string }

const SUBJECTS = getSubjects()
const STUDENT_NAMES = getStudentNames()
const YEARS = [2023, 2024]

function createEmptyRow(): BulkRow {
  return { _key: crypto.randomUUID(), studentName: '', scoreInput: '' }
}

type Props = {
  onSubmit: (inputs: CreateGradeInput[]) => void
  submitting?: boolean
}

export function GradeBulkCreateForm({ onSubmit, submitting }: Props) {
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [year, setYear] = useState(YEARS[YEARS.length - 1])
  const [semester, setSemester] = useState<Semester>('spring')
  const [rows, setRows] = useState<BulkRow[]>(() => [
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ])

  function updateRow(key: string, patch: Partial<BulkRow>) {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, createEmptyRow()])
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._key !== key) : prev))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const inputs: CreateGradeInput[] = rows
      .filter((r) => r.studentName.trim())
      .map((r) => ({
        studentName: r.studentName,
        subject,
        score: parseInt(r.scoreInput, 10) || 0,
        year,
        semester,
      }))
    onSubmit(inputs)
  }

  return (
    <form className="grade-bulk-form" onSubmit={handleSubmit}>
      <div className="grade-bulk-form__common">
        <div className="grade-bulk-form__common-field">
          <label htmlFor="gbc-subject">科目</label>
          <select
            id="gbc-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={submitting}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="grade-bulk-form__common-field">
          <label htmlFor="gbc-year">年度</label>
          <select
            id="gbc-year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            disabled={submitting}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}年度
              </option>
            ))}
          </select>
        </div>
        <div className="grade-bulk-form__common-field">
          <label htmlFor="gbc-semester">学期</label>
          <select
            id="gbc-semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value as Semester)}
            disabled={submitting}
          >
            <option value="spring">前期</option>
            <option value="fall">後期</option>
          </select>
        </div>
      </div>

      <p className="grade-bulk-form__hint">学生名が空の行は無視されます。</p>

      <datalist id="gbc-student-list">
        {STUDENT_NAMES.map((s) => (
          <option key={s.id} value={s.name} />
        ))}
      </datalist>

      <div className="grade-bulk-form__rows">
        <div className="grade-bulk-form__row grade-bulk-form__row--header">
          <span>学生名</span>
          <span>点数</span>
          <span aria-hidden="true" />
        </div>

        {rows.map((row) => {
          const parsedScore = parseInt(row.scoreInput, 10)
          const isValidScore =
            row.scoreInput === '' || (!isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100)

          return (
            <div key={row._key} className="grade-bulk-form__row">
              <input
                type="text"
                list="gbc-student-list"
                placeholder="例) 田中 太郎"
                value={row.studentName}
                onChange={(e) => updateRow(row._key, { studentName: e.target.value })}
                disabled={submitting}
              />
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="0〜100"
                value={row.scoreInput}
                onChange={(e) => updateRow(row._key, { scoreInput: e.target.value })}
                className={!isValidScore ? 'grade-bulk-form__input--invalid' : ''}
                disabled={submitting}
              />
              <button
                type="button"
                className="grade-bulk-form__remove"
                onClick={() => removeRow(row._key)}
                disabled={rows.length === 1 || submitting}
                aria-label="行を削除"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" className="grade-bulk-form__add" onClick={addRow} disabled={submitting}>
        ＋ 行を追加
      </button>

      <div className="grade-bulk-form__actions">
        <button type="submit" className="grade-bulk-form__submit" disabled={submitting}>
          {submitting ? '登録中...' : 'まとめて登録'}
        </button>
      </div>
    </form>
  )
}
