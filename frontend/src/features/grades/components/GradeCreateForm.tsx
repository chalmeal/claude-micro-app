import { useState, type FormEvent } from 'react'
import { getStudentNames, getSubjects } from '@/features/grades/api/getGrades'
import {
  scoreToLetter,
  type CreateGradeInput,
  type GradeLetter,
  type Semester,
} from '@/features/grades/types'

type Props = {
  onSubmit: (input: CreateGradeInput) => void
  submitting?: boolean
}

const SUBJECTS = getSubjects()
const STUDENT_NAMES = getStudentNames()
const YEARS = [2023, 2024]

const letterColorClass: Record<GradeLetter, string> = {
  S: 'grade-create-form__badge--s',
  A: 'grade-create-form__badge--a',
  B: 'grade-create-form__badge--b',
  C: 'grade-create-form__badge--c',
  D: 'grade-create-form__badge--d',
  F: 'grade-create-form__badge--f',
}

const initialValues: CreateGradeInput = {
  studentName: '',
  subject: SUBJECTS[0],
  score: 0,
  year: YEARS[YEARS.length - 1],
  semester: 'spring',
}

export function GradeCreateForm({ onSubmit, submitting }: Props) {
  const [values, setValues] = useState<CreateGradeInput>(initialValues)
  const [scoreInput, setScoreInput] = useState('0')
  const [studentNameError, setStudentNameError] = useState(false)
  const [scoreSubmitError, setScoreSubmitError] = useState(false)

  function update<K extends keyof CreateGradeInput>(key: K, value: CreateGradeInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const parsedScore = parseInt(scoreInput, 10)
  const isValidScore =
    !isNaN(parsedScore) && Number.isInteger(parsedScore) && parsedScore >= 0 && parsedScore <= 100
  const previewLetter = isValidScore ? scoreToLetter(parsedScore) : null

  const showScoreError = !isValidScore && (scoreInput !== '' || scoreSubmitError)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const hasStudentNameError = !values.studentName.trim()
    setStudentNameError(hasStudentNameError)
    if (!isValidScore) {
      setScoreSubmitError(true)
    }
    if (hasStudentNameError || !isValidScore) return
    onSubmit({ ...values, score: parsedScore })
  }

  return (
    <form className="grade-create-form" onSubmit={handleSubmit}>
      <div className="grade-create-form__grid">
        <div className="grade-create-form__field">
          <label htmlFor="gc-year">年度</label>
          <select
            id="gc-year"
            value={values.year}
            onChange={(e) => update('year', Number(e.target.value))}
            disabled={submitting}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}年度
              </option>
            ))}
          </select>
        </div>

        <div className="grade-create-form__field">
          <label htmlFor="gc-semester">学期</label>
          <select
            id="gc-semester"
            value={values.semester}
            onChange={(e) => update('semester', e.target.value as Semester)}
            disabled={submitting}
          >
            <option value="spring">前期</option>
            <option value="fall">後期</option>
          </select>
        </div>
        <div
          className={`grade-create-form__field${studentNameError ? ' grade-create-form__field--error' : ''}`}
        >
          <label htmlFor="gc-student">
            学生名{' '}
            <span className="grade-create-form__required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="gc-student"
            type="text"
            list="gc-student-list"
            aria-required="true"
            aria-invalid={studentNameError}
            placeholder="例) 田中 太郎"
            value={values.studentName}
            onChange={(e) => {
              update('studentName', e.target.value)
              if (e.target.value.trim()) setStudentNameError(false)
            }}
            disabled={submitting}
          />
          <datalist id="gc-student-list">
            {STUDENT_NAMES.map((s) => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
          {studentNameError && (
            <span className="grade-create-form__error-msg" role="alert">
              学生名を入力してください
            </span>
          )}
        </div>

        <div className="grade-create-form__field">
          <label htmlFor="gc-subject">科目</label>
          <select
            id="gc-subject"
            value={values.subject}
            onChange={(e) => update('subject', e.target.value)}
            disabled={submitting}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grade-create-form__field">
        <label htmlFor="gc-score">
          点数{' '}
          <span className="grade-create-form__required" aria-hidden="true">
            *
          </span>
        </label>
        <div className="grade-create-form__score-row">
          <input
            id="gc-score"
            type="number"
            min={0}
            max={100}
            step={1}
            value={scoreInput}
            onChange={(e) => {
              setScoreInput(e.target.value)
              setScoreSubmitError(false)
            }}
            className={`grade-create-form__score-input${showScoreError ? ' grade-create-form__score-input--invalid' : ''}`}
            disabled={submitting}
            aria-required="true"
            aria-invalid={showScoreError}
            aria-describedby="gc-score-hint"
          />
          <span className="grade-create-form__score-max">/ 100</span>
          {previewLetter && (
            <span className={`grade-create-form__badge ${letterColorClass[previewLetter]}`}>
              {previewLetter}
            </span>
          )}
        </div>
        <p id="gc-score-hint" className="grade-create-form__hint">
          0〜100 の整数を入力してください。評価は自動で計算されます。
        </p>
        {showScoreError && (
          <p className="grade-create-form__field-error" role="alert">
            0〜100 の整数を入力してください
          </p>
        )}
      </div>

      <div className="grade-create-form__actions">
        <button
          type="submit"
          className="grade-create-form__submit"
          disabled={submitting}
        >
          {submitting ? '登録中...' : '登録'}
        </button>
      </div>
    </form>
  )
}
