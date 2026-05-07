import { useState, type FormEvent } from 'react'
import type { CreateUserInput } from '@/features/users/types'

type BulkRow = CreateUserInput & { _key: string }

function createEmptyRow(): BulkRow {
  return {
    _key: crypto.randomUUID(),
    name: '',
    email: '',
    role: 'member',
    status: 'active',
  }
}

type Props = {
  onSubmit: (inputs: CreateUserInput[]) => void
  onCancel: () => void
  submitting?: boolean
}

export function UserBulkCreateForm({ onSubmit, onCancel, submitting }: Props) {
  const [rows, setRows] = useState<BulkRow[]>(() => [
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ])

  function updateRow(key: string, patch: Partial<CreateUserInput>) {
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
    const inputs: CreateUserInput[] = rows
      .filter((r) => r.name.trim() || r.email.trim())
      .map((r) => ({
        name: r.name,
        email: r.email,
        role: r.role,
        status: r.status,
      }))
    onSubmit(inputs)
  }

  return (
    <form className="bulk-form" onSubmit={handleSubmit}>
      <p className="bulk-form__hint">空の行は無視されます。同じメールアドレスは登録できません。</p>

      <div className="bulk-form__rows">
        <div className="bulk-form__row bulk-form__row--header">
          <span>名前</span>
          <span>メールアドレス</span>
          <span>ロール</span>
          <span>ステータス</span>
          <span aria-hidden="true" />
        </div>

        {rows.map((row) => (
          <div key={row._key} className="bulk-form__row">
            <input
              type="text"
              placeholder="例) 田中 太郎"
              value={row.name}
              onChange={(e) => updateRow(row._key, { name: e.target.value })}
            />
            <input
              type="email"
              placeholder="例) tanaka@example.com"
              value={row.email}
              onChange={(e) => updateRow(row._key, { email: e.target.value })}
            />
            <select
              value={row.role}
              onChange={(e) =>
                updateRow(row._key, {
                  role: e.target.value as CreateUserInput['role'],
                })
              }
            >
              <option value="member">メンバー</option>
              <option value="admin">管理者</option>
            </select>
            <select
              value={row.status}
              onChange={(e) =>
                updateRow(row._key, {
                  status: e.target.value as CreateUserInput['status'],
                })
              }
            >
              <option value="active">有効</option>
              <option value="inactive">無効</option>
            </select>
            <button
              type="button"
              className="bulk-form__remove"
              onClick={() => removeRow(row._key)}
              disabled={rows.length === 1}
              aria-label="行を削除"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="bulk-form__add" onClick={addRow}>
        ＋ 行を追加
      </button>

      <div className="bulk-form__actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          キャンセル
        </button>
        <button type="submit" className="bulk-form__submit" disabled={submitting}>
          {submitting ? '登録中...' : 'まとめて登録'}
        </button>
      </div>
    </form>
  )
}
