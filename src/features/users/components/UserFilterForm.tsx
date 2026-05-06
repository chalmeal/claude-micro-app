import { useState, type FormEvent } from 'react'
import {
  emptyUserFilters,
  type UserFilters,
} from '@/features/users/types'

type Props = {
  onSubmit: (filters: UserFilters) => void
  onReset?: () => void
  initialFilters?: UserFilters
}

export function UserFilterForm({
  onSubmit,
  onReset,
  initialFilters = emptyUserFilters,
}: Props) {
  const [filters, setFilters] = useState<UserFilters>(initialFilters)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(filters)
  }

  function handleReset() {
    setFilters(emptyUserFilters)
    onReset?.()
  }

  function update<K extends keyof UserFilters>(key: K, value: UserFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form className="user-filter-form" onSubmit={handleSubmit}>
      <div className="user-filter-form__grid">
        <div className="user-filter-form__field user-filter-form__field--wide">
          <label htmlFor="filter-keyword">キーワード</label>
          <input
            id="filter-keyword"
            type="search"
            placeholder="名前またはメールアドレス"
            value={filters.keyword}
            onChange={(e) => update('keyword', e.target.value)}
          />
        </div>

        <div className="user-filter-form__field">
          <label htmlFor="filter-role">ロール</label>
          <select
            id="filter-role"
            value={filters.role}
            onChange={(e) =>
              update('role', e.target.value as UserFilters['role'])
            }
          >
            <option value="">すべて</option>
            <option value="admin">管理者</option>
            <option value="member">メンバー</option>
          </select>
        </div>

        <div className="user-filter-form__field">
          <label htmlFor="filter-status">ステータス</label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) =>
              update('status', e.target.value as UserFilters['status'])
            }
          >
            <option value="">すべて</option>
            <option value="active">有効</option>
            <option value="inactive">無効</option>
          </select>
        </div>

        <div className="user-filter-form__field">
          <label htmlFor="filter-date-from">登録日(開始)</label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update('dateFrom', e.target.value)}
          />
        </div>

        <div className="user-filter-form__field">
          <label htmlFor="filter-date-to">登録日(終了)</label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => update('dateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="user-filter-form__actions">
        <button type="button" onClick={handleReset}>
          リセット
        </button>
        <button type="submit" className="user-filter-form__submit">
          検索
        </button>
      </div>
    </form>
  )
}
