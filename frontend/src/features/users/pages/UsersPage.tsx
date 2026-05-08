import { useMemo, useState } from 'react'
import { UserFilterForm } from '@/features/users/components/UserFilterForm'
import { UserList } from '@/features/users/components/UserList'
import { useUsers } from '@/features/users/hooks/useUsers'
import { emptyUserFilters, type UserFilters } from '@/features/users/types'
import { filterUsers } from '@/features/users/utils/filterUsers'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { ResultCount } from '@/shared/components/ResultCount'
import { SkeletonRows } from '@/shared/components/SkeletonRows'
import './UsersPage.css'

const PAGE_SIZE = 30

export function UsersPage() {
  const { users, loading, error } = useUsers()
  const [filters, setFilters] = useState<UserFilters>(emptyUserFilters)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredUsers = useMemo(() => filterUsers(users, filters), [users, filters])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedUsers = useMemo(
    () => filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredUsers, safePage],
  )

  function handleFilterSubmit(next: UserFilters) {
    setFilters(next)
    setCurrentPage(1)
  }

  function handleFilterReset() {
    setFilters(emptyUserFilters)
    setCurrentPage(1)
  }

  const rangeStart = filteredUsers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredUsers.length)

  return (
    <div className="users-page">
      <PageHeader
        title="ユーザー"
        description="システムに登録されているユーザーの一覧です"
        action={{ label: 'ユーザー登録', to: '/users/new' }}
      />

      <UserFilterForm onSubmit={handleFilterSubmit} onReset={handleFilterReset} />

      <ErrorAlert error={error} />

      {loading ? (
        <SkeletonRows count={5} />
      ) : (
        <>
          <ResultCount
            total={filteredUsers.length}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            emptyMessage="該当するユーザーはいません"
            totalRaw={users.length}
          />
          <UserList users={paginatedUsers} />
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
