import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUser, createUsers } from '@/features/users/api/getUsers'
import { UserBulkCreateForm } from '@/features/users/components/UserBulkCreateForm'
import { UserCreateForm } from '@/features/users/components/UserCreateForm'
import { UserCsvImportForm } from '@/features/users/components/UserCsvImportForm'
import type { CreateUserInput } from '@/features/users/types'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './UserCreatePage.css'

type Mode = 'single' | 'bulk' | 'csv'

const tabs: { value: Mode; label: string; description: string }[] = [
  {
    value: 'single',
    label: '個別登録',
    description: '1人ずつフォームに入力して登録します',
  },
  {
    value: 'bulk',
    label: 'まとめて登録',
    description: '複数人をまとめて入力して一括登録します',
  },
  {
    value: 'csv',
    label: 'CSV取り込み',
    description: 'CSV ファイルを取り込んで一括登録します',
  },
]

export function UserCreatePage() {
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
      navigate('/users')
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setSubmitting(false)
    }
  }

  function handleSingleSubmit(input: CreateUserInput) {
    runSubmit(() => createUser(input), 'ユーザーを登録しました')
  }

  function handleBulkSubmit(inputs: CreateUserInput[]) {
    if (inputs.length === 0) {
      setError(new Error('登録する行がありません'))
      return
    }
    runSubmit(() => createUsers(inputs), `${inputs.length}件のユーザーを登録しました`)
  }

  function handleCancel() {
    navigate('/users')
  }

  function handleTabChange(next: Mode) {
    if (submitting) return
    setMode(next)
    setError(null)
  }

  const activeTab = tabs.find((t) => t.value === mode)!

  return (
    <div className="user-create">
      <Link to="/users" className="user-create__back">
        ← ユーザー一覧に戻る
      </Link>

      <section className="user-create__intro">
        <h1>ユーザー登録</h1>
        <p>登録方法を選択してください</p>
      </section>

      <div className="user-create__tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={mode === tab.value}
            className={`user-create__tab${
              mode === tab.value ? ' user-create__tab--active' : ''
            }`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="user-create__tab-description">{activeTab.description}</p>

      {error && (
        <p className="user-create__error" role="alert">
          {error.message}
        </p>
      )}

      <div className="user-create__card">
        {mode === 'single' && (
          <UserCreateForm
            onSubmit={handleSingleSubmit}
            onCancel={handleCancel}
            submitting={submitting}
          />
        )}
        {mode === 'bulk' && (
          <UserBulkCreateForm
            onSubmit={handleBulkSubmit}
            onCancel={handleCancel}
            submitting={submitting}
          />
        )}
        {mode === 'csv' && (
          <UserCsvImportForm
            onSubmit={handleBulkSubmit}
            onCancel={handleCancel}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  )
}
