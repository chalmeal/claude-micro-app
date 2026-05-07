import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteGrade } from '@/features/grades/api/getGrades'
import { useGrade } from '@/features/grades/hooks/useGrade'
import type { Grade, GradeLetter, Semester } from '@/features/grades/types'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './GradeDetailPage.css'

const semesterLabel: Record<Semester, string> = {
  spring: '前期',
  fall: '後期',
}

const letterColorClass: Record<GradeLetter, string> = {
  S: 'grade-detail__letter--s',
  A: 'grade-detail__letter--a',
  B: 'grade-detail__letter--b',
  C: 'grade-detail__letter--c',
  D: 'grade-detail__letter--d',
  F: 'grade-detail__letter--f',
}

function termPeriod(grade: Grade) {
  return `${grade.year}年度 ${semesterLabel[grade.semester]}`
}

function prevTermPeriod(grade: Grade) {
  const prevYear = grade.semester === 'spring' ? grade.year - 1 : grade.year
  const prevSemester: Semester = grade.semester === 'spring' ? 'fall' : 'spring'
  return `${prevYear}年度 ${semesterLabel[prevSemester]}`
}

function ScoreDiff({ diff }: { diff: number }) {
  if (diff === 0) return <span className="grade-detail__diff grade-detail__diff--neutral">± 0</span>
  if (diff > 0) return <span className="grade-detail__diff grade-detail__diff--up">▲ +{diff}</span>
  return <span className="grade-detail__diff grade-detail__diff--down">▼ {diff}</span>
}

export function GradeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { grade, previousGrade, allTermGrades, loading, error } = useGrade(id)
  const navigate = useNavigate()
  const snackbar = useSnackbar()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteConfirm() {
    if (!grade) return
    setConfirmOpen(false)
    setDeleting(true)
    try {
      await deleteGrade(grade.id)
      snackbar.show('成績を削除しました')
      navigate('/grades')
    } catch (err) {
      snackbar.show(err instanceof Error ? err.message : '削除に失敗しました')
      setDeleting(false)
    }
  }

  return (
    <>
      {confirmOpen && grade && (
        <ConfirmDialog
          title="成績を削除しますか？"
          message={`${grade.studentName} の ${grade.subject}（${grade.year}年度 ${grade.semester === 'spring' ? '前期' : '後期'}）の成績を削除します。この操作は元に戻せません。`}
          confirmLabel="削除する"
          dangerous
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
      <div className="grade-detail">
        <Link to="/grades" className="grade-detail__back">
          ← 成績一覧に戻る
        </Link>

        {error && (
          <p className="grade-detail__error" role="alert">
            データの読み込みに失敗しました: {error.message}
          </p>
        )}

        {loading && (
          <div className="grade-detail__skeleton" aria-busy="true">
            <div className="grade-detail__skeleton-block grade-detail__skeleton-block--title" />
            <div className="grade-detail__skeleton-block" />
            <div className="grade-detail__skeleton-block" />
          </div>
        )}

        {!loading && !grade && !error && (
          <div className="grade-detail__not-found">
            <h1>成績データが見つかりません</h1>
            <p>指定された成績データは存在しないか、削除された可能性があります。</p>
          </div>
        )}

        {grade && (
          <article className="grade-detail__card">
            <header className="grade-detail__header">
              <div
                className={`grade-detail__icon ${letterColorClass[grade.letter]}`}
                aria-hidden="true"
              >
                {grade.letter}
              </div>
              <div className="grade-detail__header-text">
                <h1 className="grade-detail__name">{grade.studentName}</h1>
                <p className="grade-detail__subject">{grade.subject}</p>
              </div>
              <div className="grade-detail__header-actions">
                <Link to={`/grades/${grade.id}/edit`} className="grade-detail__edit-btn">
                  編集
                </Link>
                <button
                  type="button"
                  className="grade-detail__delete-btn"
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                >
                  {deleting ? '削除中...' : '削除'}
                </button>
              </div>
            </header>

            {/* 今学期 / 前学期 横並び比較 */}
            <div className="grade-detail__terms-grid">
              <div className="grade-detail__term-card grade-detail__term-card--current">
                <p className="grade-detail__term-tag">今学期</p>
                <p className="grade-detail__term-period">{termPeriod(grade)}</p>
                <p className="grade-detail__term-score">
                  {grade.score}
                  <span className="grade-detail__term-score-max"> / 100</span>
                </p>
                <div className="grade-detail__term-footer">
                  <span className={`grade-detail__badge ${letterColorClass[grade.letter]}`}>
                    {grade.letter}
                  </span>
                  {previousGrade && <ScoreDiff diff={grade.score - previousGrade.score} />}
                </div>
              </div>

              <div
                className={`grade-detail__term-card${previousGrade ? '' : ' grade-detail__term-card--empty'}`}
              >
                <p className="grade-detail__term-tag">前学期</p>
                {previousGrade ? (
                  <>
                    <p className="grade-detail__term-period">{prevTermPeriod(grade)}</p>
                    <p className="grade-detail__term-score">
                      {previousGrade.score}
                      <span className="grade-detail__term-score-max"> / 100</span>
                    </p>
                    <div className="grade-detail__term-footer">
                      <span
                        className={`grade-detail__badge ${letterColorClass[previousGrade.letter]}`}
                      >
                        {previousGrade.letter}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="grade-detail__term-nodata">前学期のデータがありません</p>
                )}
              </div>
            </div>

            {/* 全学期の成績リンク */}
            {allTermGrades.length > 0 && (
              <section className="grade-detail__all-terms">
                <h2 className="grade-detail__section-title">全学期の成績</h2>
                <div className="grade-detail__terms-row">
                  {allTermGrades.map((g) => (
                    <Link
                      key={g.id}
                      to={`/grades/${g.id}`}
                      className={`grade-detail__term-link${g.id === grade.id ? ' grade-detail__term-link--active' : ''}`}
                      aria-current={g.id === grade.id ? 'page' : undefined}
                    >
                      <span className="grade-detail__term-link-period">
                        {g.year}年度 {semesterLabel[g.semester]}
                      </span>
                      <span className="grade-detail__term-link-score">{g.score}</span>
                      <span className={`grade-detail__badge ${letterColorClass[g.letter]}`}>
                        {g.letter}
                      </span>
                      {g.id === grade.id && (
                        <span className="grade-detail__term-link-now">現在</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </div>
    </>
  )
}
