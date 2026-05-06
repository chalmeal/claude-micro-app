import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GradeList } from '@/features/grades/components/GradeList'
import { useGrades } from '@/features/grades/hooks/useGrades'
import {
  emptyGradeFilters,
  type GradeFilters,
  type GradeLetter,
  type Semester,
} from '@/features/grades/types'
import { getSubjects } from '@/features/grades/api/getGrades'
import { Pagination } from '@/shared/components/Pagination'
import './GradesPage.css'

const PAGE_SIZE = 30
const LETTERS: GradeLetter[] = ['S', 'A', 'B', 'C', 'D', 'F']
const YEARS = ['2023', '2024']
const STORAGE_KEY = 'grades-search-state'

type SavedState = {
  filters: GradeFilters
  currentPage: number
}

function loadSavedState(): SavedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedState) : null
  } catch {
    return null
  }
}

export function GradesPage() {
  const { grades, loading, error, search } = useGrades()

  const [draft, setDraft] = useState<GradeFilters>(() => loadSavedState()?.filters ?? emptyGradeFilters)
  const [filters, setFilters] = useState<GradeFilters>(() => loadSavedState()?.filters ?? emptyGradeFilters)
  const [hasSearched, setHasSearched] = useState(false)
  const [yearError, setYearError] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => loadSavedState()?.currentPage ?? 1)
  const [shouldRestore] = useState(() => !!(loadSavedState()?.filters.year))

  const subjects = useMemo(() => getSubjects(), [])

  // マウント時に保存済み状態があれば自動で再検索
  useEffect(() => {
    if (shouldRestore) {
      search().then(() => setHasSearched(true))
    }
  }, [search, shouldRestore])

  // 検索条件をセッションストレージに保存
  useEffect(() => {
    if (!hasSearched) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, currentPage }))
    } catch { /* ignore */ }
  }, [hasSearched, filters, currentPage])

  const filtered = useMemo(() => {
    if (!hasSearched) return []
    return grades.filter((g) => {
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase()
        if (
          !g.studentName.toLowerCase().includes(kw) &&
          !g.subject.toLowerCase().includes(kw)
        ) return false
      }
      if (filters.subject && g.subject !== filters.subject) return false
      if (filters.semester && g.semester !== filters.semester) return false
      if (filters.year && String(g.year) !== filters.year) return false
      if (filters.letter && g.letter !== filters.letter) return false
      return true
    })
  }, [grades, filters, hasSearched])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.year) {
      setYearError(true)
      return
    }
    setYearError(false)
    setFilters(draft)
    setCurrentPage(1)
    if (grades.length === 0) {
      await search()
    }
    setHasSearched(true)
  }

  function handleReset() {
    setDraft(emptyGradeFilters)
    setFilters(emptyGradeFilters)
    setHasSearched(false)
    setYearError(false)
    setCurrentPage(1)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="grades-page">
      <section className="grades-page__intro">
        <div>
          <h1>成績一覧</h1>
          <p>年度を選択して検索してください</p>
        </div>
        <Link to="/grades/new" className="grades-page__create-btn">
          成績を登録
        </Link>
      </section>

      <form className="grade-filter-form" onSubmit={handleSubmit}>
        <div className="grade-filter-form__grid">
          <div className="grade-filter-form__field grade-filter-form__field--wide">
            <label htmlFor="gf-keyword">キーワード</label>
            <input
              id="gf-keyword"
              type="text"
              placeholder="学生名・科目名で検索"
              value={draft.keyword}
              onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
            />
          </div>
          <div className={`grade-filter-form__field${yearError ? ' grade-filter-form__field--error' : ''}`}>
            <label htmlFor="gf-year">
              年度 <span className="grade-filter-form__required" aria-hidden="true">*</span>
            </label>
            <select
              id="gf-year"
              value={draft.year}
              aria-required="true"
              aria-invalid={yearError}
              onChange={(e) => {
                setDraft((d) => ({ ...d, year: e.target.value }))
                if (e.target.value) setYearError(false)
              }}
            >
              <option value="">選択してください</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}年度</option>
              ))}
            </select>
            {yearError && (
              <span className="grade-filter-form__error-msg" role="alert">
                年度を選択してください
              </span>
            )}
          </div>
          <div className="grade-filter-form__field">
            <label htmlFor="gf-subject">科目</label>
            <select
              id="gf-subject"
              value={draft.subject}
              onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
            >
              <option value="">すべて</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grade-filter-form__field">
            <label htmlFor="gf-semester">学期</label>
            <select
              id="gf-semester"
              value={draft.semester}
              onChange={(e) =>
                setDraft((d) => ({ ...d, semester: e.target.value as Semester | '' }))
              }
            >
              <option value="">すべて</option>
              <option value="spring">前期</option>
              <option value="fall">後期</option>
            </select>
          </div>
          <div className="grade-filter-form__field">
            <label htmlFor="gf-letter">評価</label>
            <select
              id="gf-letter"
              value={draft.letter}
              onChange={(e) =>
                setDraft((d) => ({ ...d, letter: e.target.value as GradeLetter | '' }))
              }
            >
              <option value="">すべて</option>
              {LETTERS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grade-filter-form__actions">
          <button type="button" onClick={handleReset}>リセット</button>
          <button type="submit" className="grade-filter-form__submit">検索</button>
        </div>
      </form>

      {error && (
        <p className="grades-page__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading && (
        <div className="grades-page__skeleton" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grades-page__skeleton-row" />
          ))}
        </div>
      )}

      {hasSearched && !loading && (
        <>
          <p className="grades-page__count">
            {filtered.length === 0
              ? '該当する成績データがありません'
              : `${rangeStart}–${rangeEnd} 件 / ${filtered.length} 件`}
          </p>
          <GradeList grades={paginated} />
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}
