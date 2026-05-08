import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { RoleBadge } from '@/shared/components/Badge'
import { StatusBadge } from '@/shared/components/Badge'
import type { User } from '@/features/users/types'

type Props = {
  users: User[]
}

const columns: Column<User>[] = [
  { key: 'name', label: '名前', render: (u) => u.name },
  { key: 'email', label: 'メールアドレス', className: 'user-list__email', render: (u) => u.email },
  { key: 'role', label: 'ロール', render: (u) => <RoleBadge role={u.role} /> },
  { key: 'status', label: 'ステータス', render: (u) => <StatusBadge status={u.status} /> },
  {
    key: 'createdAt',
    label: '登録日',
    className: 'user-list__date',
    render: (u) => u.createdAt,
  },
]

export function UserList({ users }: Props) {
  const navigate = useNavigate()

  return (
    <DataTable
      columns={columns}
      rows={users}
      getRowKey={(u) => u.id}
      onRowClick={(u) => navigate(`/users/${u.id}`)}
      getRowAriaLabel={(u) => `${u.name} の詳細を表示`}
      emptyMessage="ユーザーが登録されていません"
    />
  )
}
