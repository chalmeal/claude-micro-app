import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User, UserRole, UserStatus } from '@/features/users/types'

type Props = {
  users: User[]
}

const roleLabel: Record<UserRole, string> = {
  admin: '管理者',
  member: 'メンバー',
}

const statusLabel: Record<UserStatus, string> = {
  active: '有効',
  inactive: '無効',
}

export function UserList({ users }: Props) {
  const navigate = useNavigate()

  function navigateToDetail(id: string) {
    navigate(`/users/${id}`)
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      navigateToDetail(id)
    }
  }

  if (users.length === 0) {
    return <p className="user-list__empty">ユーザーが登録されていません</p>
  }

  return (
    <div className="user-list">
      <table className="user-list__table">
        <thead>
          <tr>
            <th>名前</th>
            <th>メールアドレス</th>
            <th>ロール</th>
            <th>ステータス</th>
            <th>登録日</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="user-list__row"
              tabIndex={0}
              aria-label={`${user.name} の詳細を表示`}
              onClick={() => navigateToDetail(user.id)}
              onKeyDown={(e) => handleRowKeyDown(e, user.id)}
            >
              <td data-label="名前">{user.name}</td>
              <td data-label="メールアドレス" className="user-list__email">
                {user.email}
              </td>
              <td data-label="ロール">
                <span className={`badge badge--role-${user.role}`}>{roleLabel[user.role]}</span>
              </td>
              <td data-label="ステータス">
                <span className={`status status--${user.status}`}>
                  <span className="status__dot" aria-hidden="true" />
                  {statusLabel[user.status]}
                </span>
              </td>
              <td data-label="登録日" className="user-list__date">
                {user.createdAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
