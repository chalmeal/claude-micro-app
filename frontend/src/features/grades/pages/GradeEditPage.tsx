import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { updateGrade } from '@/features/grades/api/getGrades'
import { useGrade } from '@/features/grades/hooks/useGrade'
import { scoreToLetter, type GradeLetter, type Semester } from '@/features/grades/types'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './GradeEditPage.css'

const semesterLabel: Record<Semester, string> = {
  spring: '前期',
  fall: '後期',
}

const letterColorClass: Record<GradeLetter, string> = {
  S: 'grade-edit__badge--s',
  A: 'grade-edit__badge--a',
  B: 'grade-edit__badge--b',
  C: 'grade-edit__badge--c',
  D: 'grade-edit__badge--d',
  F: 'grade-edit__badge--f',
}

export function GradeEditPage() {
  const { id } = useParams<{ id: string }>()
  const { grade, loading, error } = useGrade(id)
  const navigate = useNavigate()
  const snackbar = useSnackbar()

  const [scoreInput, setScoreInput] = useState('')
  const [syncedId, setSyncedId] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  if (grade && grade.id !== syncedId) {
    setSyncedId(grade.id)
    setScoreInput(String(grade.score))
  }

  const parsedScore = parseInt(scoreInput, 10)
  const isValidScore =
    !isNaN(parsedScore) && Number.isInteger(parsedScore) && parsedScore >= 0 && parsedScore <= 100
  const previewLetter = isValidScore ? scoreToLetter(parsedScore) : null
  const isDirty = isValidScore && grade !== null && parsedScore !== grade.score

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!grade || !isValidScore) return
    setShowConfirm(true)
  }

  async function doSave() {
    if (!grade) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateGrade(grade.id, parsedScore)
      snackbar.show('点数を更新しました')
      navigate(`/grades/${grade.id}`)
    } catch (err) {
      setSaveError(err instanceof Error ? err : new Error(String(err)))
      setSaving(false)
    }
  }

  return (
    <div className="grade-edit">
      <Link to={id ? `/grades/${id}` : '/grades'} className="grade-edit__back">
        ← 詳細に戻る
      </Link>

      {error && (
        <p className="grade-edit__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading && (
        <div className="grade-edit__skeleton" aria-busy="true">
          <div className="grade-edit__skeleton-block grade-edit__skeleton-block--title" />
          <div className="grade-edit__skeleton-block" />
          <div className="grade-edit__skeleton-block" />
        </div>
      )}

      {!loading && !grade && !error && (
        <div className="grade-edit__not-found">
          <h1>成績データが見つかりません</h1>
        </div>
      )}

      {showConfirm && grade && previewLetter && (
        <ConfirmDialog
          title="更新の確認"
          message="以下の内容で点数を更新しますか？"
          details={
            <table className="confirm-detail-table">
              <tbody>
                <tr><th>学生名</th><td>{grade.studentName}</td></tr>
                <tr><th>科目</th><td>{grade.subject}</td></tr>
                <tr><th>年度・学期</th><td>{grade.year}年度 {semesterLabel[grade.semester]}</td></tr>
                <tr><th>変更前</th><td>{grade.score}点 ({grade.letter})</td></tr>
                <tr><th>変更後</th><td>{parsedScore}点 ({previewLetter})</td></tr>
              </tbody>
            </table>
          }
          confirmLabel="更新する"
          onConfirm={() => { setShowConfirm(false); doSave() }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {grade && (
        <div className="grade-edit__card">
          <header className="grade-edit__header">
            <h1 className="grade-edit__title">成績編集</h1>
            <p className="grade-edit__meta">
              {grade.studentName} &nbsp;/&nbsp; {grade.subject} &nbsp;/&nbsp;
              {grade.year}年度 {semesterLabel[grade.semester]}
            </p>
          </header>

          {saveError && (
            <p className="grade-edit__save-error" role="alert">
              {saveError.message}
            </p>
          )}

          <form onSubmit={handleSave} className="grade-edit__form">
            <div className="grade-edit__field">
              <label htmlFor="ge-score" className="grade-edit__label">
                点数
              </label>
              <div className="grade-edit__score-row">
                <input
                  id="ge-score"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className={`grade-edit__input${!isValidScore && scoreInput !== '' ? ' grade-edit__input--invalid' : ''}`}
                  disabled={saving}
                  aria-describedby="ge-score-hint"
                />
                <span className="grade-edit__score-max">/ 100</span>
                {previewLetter && (
                  <span className={`grade-edit__badge ${letterColorClass[previewLetter]}`}>
                    {previewLetter}
                  </span>
                )}
              </div>
              <p id="ge-score-hint" className="grade-edit__hint">
                0〜100 の整数を入力してください。評価は自動で計算されます。
              </p>
              {!isValidScore && scoreInput !== '' && (
                <p className="grade-edit__field-error" role="alert">
                  0〜100 の整数を入力してください
                </p>
              )}
            </div>

            <div className="grade-edit__actions">
              <Link to={`/grades/${grade.id}`} className="grade-edit__cancel">
                キャンセル
              </Link>
              <button type="submit" className="grade-edit__submit" disabled={!isDirty || saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
