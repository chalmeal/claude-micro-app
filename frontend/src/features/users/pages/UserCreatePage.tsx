import { type ReactNode, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUser, createUsers } from '@/features/users/api/getUsers'
import { UserBulkCreateForm } from '@/features/users/components/UserBulkCreateForm'
import { UserCreateForm } from '@/features/users/components/UserCreateForm'
import { UserCsvImportForm } from '@/features/users/components/UserCsvImportForm'
import type { CreateUserInput } from '@/features/users/types'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
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

const ROLE_LABEL = { admin: '管理者', member: 'メンバー' } as const
const STATUS_LABEL = { active: '有効', inactive: '無効' } as const

function buildSingleDetails(input: CreateUserInput): ReactNode {
  return (
    <table className="confirm-detail-table">
      <tbody>
        <tr><th>氏名</th><td>{input.name}</td></tr>
        <tr><th>メール</th><td>{input.email}</td></tr>
        <tr><th>権限</th><td>{ROLE_LABEL[input.role]}</td></tr>
        <tr><th>ステータス</th><td>{STATUS_LABEL[input.status]}</td></tr>
      </tbody>
    </table>
  )
}

function buildBulkDetails(inputs: CreateUserInput[]): ReactNode {
  return (
    <div className="confirm-dialog__details--scroll">
      <table className="confirm-detail-table">
        <thead>
          <tr>
            <th>氏名</th>
            <th>メール</th>
            <th>権限</th>
            <th>ステータス</th>
          </tr>
        </thead>
        <tbody>
          {inputs.map((u, i) => (
            <tr key={i}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{ROLE_LABEL[u.role]}</td>
              <td>{STATUS_LABEL[u.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Confirm = { message: string; details: ReactNode; callback: () => void }

export function UserCreatePage() {
  const navigate = useNavigate()
  const snackbar = useSnackbar()
  const [mode, setMode] = useState<Mode>('single')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)

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
    setConfirm({
      message: '以下の内容でユーザーを登録しますか？',
      details: buildSingleDetails(input),
      callback: () => runSubmit(() => createUser(input), 'ユーザーを登録しました'),
    })
  }

  function handleBulkSubmit(inputs: CreateUserInput[]) {
    if (inputs.length === 0) {
      setError(new Error('登録する行がありません'))
      return
    }
    setConfirm({
      message: `以下 ${inputs.length}件のユーザーを登録しますか？`,
      details: buildBulkDetails(inputs),
      callback: () => runSubmit(() => createUsers(inputs), `${inputs.length}件のユーザーを登録しました`),
    })
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
            className={`user-create__tab${mode === tab.value ? ' user-create__tab--active' : ''}`}
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

      {confirm && (
        <ConfirmDialog
          title="登録の確認"
          message={confirm.message}
          details={confirm.details}
          confirmLabel="登録する"
          onConfirm={() => {
            const cb = confirm.callback
            setConfirm(null)
            cb()
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
