import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createGrade, createGrades } from '@/features/grades/api/getGrades'
import { GradeBulkCreateForm } from '@/features/grades/components/GradeBulkCreateForm'
import { GradeCreateForm } from '@/features/grades/components/GradeCreateForm'
import { GradeCsvImportForm } from '@/features/grades/components/GradeCsvImportForm'
import { type CreateGradeInput } from '@/features/grades/types'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './GradeCreatePage.css'

type Mode = 'single' | 'bulk' | 'csv'

const tabs: { value: Mode; label: string; description: string }[] = [
  {
    value: 'single',
    label: '個別登録',
    description: '1件ずつフォームに入力して登録します',
  },
  {
    value: 'bulk',
    label: 'まとめて登録',
    description: '複数件をまとめて入力して一括登録します',
  },
  {
    value: 'csv',
    label: 'CSV取り込み',
    description: 'CSV ファイルを取り込んで一括登録します',
  },
]

export function GradeCreatePage() {
  const navigate = useNavigate()
  const snackbar = useSnackbar()
  const [mode, setMode] = useState<Mode>('single')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function runSubmit(action: () => Promise<unknown>, successMessage: string) {
    setSubmitting(true)
    setError(null)
    try {
      await action()
      snackbar.show(successMessage)
      navigate('/grades')
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setSubmitting(false)
    }
  }

  function handleSingleSubmit(input: CreateGradeInput) {
    runSubmit(() => createGrade(input), '成績を登録しました')
  }

  function handleBulkSubmit(inputs: CreateGradeInput[]) {
    if (inputs.length === 0) {
      setError(new Error('登録する行がありません'))
      return
    }
    runSubmit(() => createGrades(inputs), `${inputs.length}件の成績を登録しました`)
  }

  function handleTabChange(next: Mode) {
    if (submitting) return
    setMode(next)
    setError(null)
  }

  const activeTab = tabs.find((t) => t.value === mode)!

  return (
    <div className="grade-create">
      <Link to="/grades" className="grade-create__back">
        ← 成績一覧に戻る
      </Link>

      <section className="grade-create__intro">
        <h1>成績登録</h1>
        <p>登録方法を選択してください</p>
      </section>

      <div className="grade-create__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={mode === tab.value}
            className={`grade-create__tab${mode === tab.value ? ' grade-create__tab--active' : ''}`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="grade-create__tab-description">{activeTab.description}</p>

      {error && (
        <p className="grade-create__error" role="alert">
          {error.message}
        </p>
      )}

      <div className="grade-create__card">
        {mode === 'single' && (
          <GradeCreateForm onSubmit={handleSingleSubmit} submitting={submitting} />
        )}
        {mode === 'bulk' && (
          <GradeBulkCreateForm onSubmit={handleBulkSubmit} submitting={submitting} />
        )}
        {mode === 'csv' && (
          <GradeCsvImportForm onSubmit={handleBulkSubmit} submitting={submitting} />
        )}
      </div>
    </div>
  )
}
