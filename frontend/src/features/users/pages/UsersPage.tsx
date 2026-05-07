import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserFilterForm } from '@/features/users/components/UserFilterForm'
import { UserList } from '@/features/users/components/UserList'
import { useUsers } from '@/features/users/hooks/useUsers'
import { emptyUserFilters, type UserFilters } from '@/features/users/types'
import { filterUsers } from '@/features/users/utils/filterUsers'
import { Pagination } from '@/shared/components/Pagination'
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
      <section className="users-page__intro">
        <div>
          <h1>ユーザー</h1>
          <p>システムに登録されているユーザーの一覧です</p>
        </div>
        <Link to="/users/new" className="users-page__create">
          ユーザー登録
        </Link>
      </section>

      <UserFilterForm onSubmit={handleFilterSubmit} onReset={handleFilterReset} />

      {error && (
        <p className="users-page__error" role="alert">
          データの読み込みに失敗しました: {error.message}
        </p>
      )}

      {loading ? (
        <div className="users-page__skeleton" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="users-page__skeleton-row" />
          ))}
        </div>
      ) : (
        <>
          <p className="users-page__count">
            {filteredUsers.length === 0
              ? '該当するユーザーはいません'
              : `${rangeStart}–${rangeEnd} 件 / ${filteredUsers.length} 件 (全 ${users.length} 件)`}
          </p>
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
