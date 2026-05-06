import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { updateUser } from '@/features/users/api/getUsers'
import { useUser } from '@/features/users/hooks/useUser'
import type {
  UpdateUserPatch,
  UserRole,
  UserStatus,
} from '@/features/users/types'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import './UserDetailPage.css'

const roleLabel: Record<UserRole, string> = {
  admin: '管理者',
  member: 'メンバー',
}

const statusLabel: Record<UserStatus, string> = {
  active: '有効',
  inactive: '無効',
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading, error, refetch } = useUser(id)
  const snackbar = useSnackbar()
  const [updating, setUpdating] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)
  const [draftRole, setDraftRole] = useState<UserRole | undefined>()
  const [draftStatus, setDraftStatus] = useState<UserStatus | undefined>()
  const [syncedId, setSyncedId] = useState<string | undefined>()

  if (id !== syncedId) {
    setSyncedId(id)
    setDraftRole(undefined)
    setDraftStatus(undefined)
    setActionError(null)
  }

  const formRole: UserRole = draftRole ?? user?.role ?? 'member'
  const formStatus: UserStatus = draftStatus ?? user?.status ?? 'active'

  const isDirty =
    user !== null &&
    ((draftRole !== undefined && draftRole !== user.role) ||
      (draftStatus !== undefined && draftStatus !== user.status))

  function handleReset() {
    setDraftRole(undefined)
    setDraftStatus(undefined)
    setActionError(null)
  }

  async function handleUpdate() {
    if (!user || !isDirty) return

    const patch: UpdateUserPatch = {}
    const changes: string[] = []
    if (draftRole !== undefined && draftRole !== user.role) {
      patch.role = draftRole
      changes.push(`ロール: ${roleLabel[user.role]} → ${roleLabel[draftRole]}`)
    }
    if (draftStatus !== undefined && draftStatus !== user.status) {
      patch.status = draftStatus
      changes.push(
        `ステータス: ${statusLabel[user.status]} → ${statusLabel[draftStatus]}`,
      )
    }

    const ok = window.confirm(
      `次の項目を更新します:\n${changes.join('\n')}\n\nよろしいですか?`,
    )
    if (!ok) return

    setUpdating(true)
    setActionError(null)
    try {
      await updateUser(user.id, patch)
      setDraftRole(undefined)
      setDraftStatus(undefined)
      refetch()
      snackbar.show('ユーザー情報を更新しました')
    } catch (err) {
      setActionError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="user-detail">
      <Link to="/users" className="user-detail__back">
        ← ユーザー一覧に戻る
      </Link>

      {error && (
        <p className="user-detail__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading && (
        <div className="user-detail__skeleton" aria-busy="true">
          <div className="user-detail__skeleton-block user-detail__skeleton-block--title" />
          <div className="user-detail__skeleton-block" />
          <div className="user-detail__skeleton-block" />
          <div className="user-detail__skeleton-block" />
        </div>
      )}

      {!loading && !user && !error && (
        <div className="user-detail__not-found">
          <h1>ユーザーが見つかりません</h1>
          <p>指定された ID のユーザーは存在しないか、削除された可能性があります。</p>
        </div>
      )}

      {user && (
        <article className="user-detail__card">
          <header className="user-detail__header">
            <div className="user-detail__avatar" aria-hidden="true">
              {user.name.slice(0, 1)}
            </div>
            <div>
              <h1 className="user-detail__name">{user.name}</h1>
              <p className="user-detail__email">{user.email}</p>
            </div>
          </header>

          {actionError && (
            <p className="user-detail__action-error" role="alert">
              {actionError.message}
            </p>
          )}

          <dl className="user-detail__list">
            <div className="user-detail__row">
              <dt>ID</dt>
              <dd>{user.id}</dd>
            </div>
            <div className="user-detail__row">
              <dt>ロール</dt>
              <dd>
                <select
                  className="user-detail__field-select"
                  value={formRole}
                  onChange={(e) =>
                    setDraftRole(e.target.value as UserRole)
                  }
                  disabled={updating}
                  aria-label="ロールを変更"
                >
                  <option value="member">メンバー</option>
                  <option value="admin">管理者</option>
                </select>
              </dd>
            </div>
            <div className="user-detail__row">
              <dt>ステータス</dt>
              <dd>
                <select
                  className="user-detail__field-select"
                  value={formStatus}
                  onChange={(e) =>
                    setDraftStatus(e.target.value as UserStatus)
                  }
                  disabled={updating}
                  aria-label="ステータスを変更"
                >
                  <option value="active">有効</option>
                  <option value="inactive">無効</option>
                </select>
              </dd>
            </div>
            <div className="user-detail__row">
              <dt>登録日</dt>
              <dd>{user.createdAt}</dd>
            </div>
          </dl>

          <footer className="user-detail__actions">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || updating}
            >
              リセット
            </button>
            <button
              type="button"
              className="user-detail__update"
              onClick={handleUpdate}
              disabled={!isDirty || updating}
            >
              {updating ? '更新中...' : '更新'}
            </button>
          </footer>
        </article>
      )}
    </div>
  )
}
