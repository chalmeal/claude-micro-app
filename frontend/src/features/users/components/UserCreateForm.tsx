import { useState, type FormEvent } from 'react'
import type { CreateUserInput } from '@/features/users/types'

type Props = {
  onSubmit: (input: CreateUserInput) => void
  onCancel: () => void
  submitting?: boolean
}

const initialValues: CreateUserInput = {
  name: '',
  email: '',
  role: 'member',
  status: 'active',
}

export function UserCreateForm({ onSubmit, onCancel, submitting }: Props) {
  const [values, setValues] = useState<CreateUserInput>(initialValues)

  function update<K extends keyof CreateUserInput>(
    key: K,
    value: CreateUserInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <form className="user-create-form" onSubmit={handleSubmit}>
      <div className="user-create-form__field">
        <label htmlFor="create-name">名前</label>
        <input
          id="create-name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </div>

      <div className="user-create-form__field">
        <label htmlFor="create-email">メールアドレス</label>
        <input
          id="create-email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
        />
      </div>

      <div className="user-create-form__field">
        <label htmlFor="create-role">ロール</label>
        <select
          id="create-role"
          value={values.role}
          onChange={(e) =>
            update('role', e.target.value as CreateUserInput['role'])
          }
        >
          <option value="member">メンバー</option>
          <option value="admin">管理者</option>
        </select>
      </div>

      <div className="user-create-form__field">
        <label htmlFor="create-status">ステータス</label>
        <select
          id="create-status"
          value={values.status}
          onChange={(e) =>
            update('status', e.target.value as CreateUserInput['status'])
          }
        >
          <option value="active">有効</option>
          <option value="inactive">無効</option>
        </select>
      </div>

      <div className="user-create-form__actions">
        <button type="button" onClick={onCancel} disabled={submitting}>
          キャンセル
        </button>
        <button
          type="submit"
          className="user-create-form__submit"
          disabled={submitting}
        >
          {submitting ? '登録中...' : '登録'}
        </button>
      </div>
    </form>
  )
}
