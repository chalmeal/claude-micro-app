import type { User, UserFilters } from '@/features/users/types'

export function filterUsers(users: User[], filters: UserFilters): User[] {
  const keyword = filters.keyword.trim().toLowerCase()

  return users.filter((user) => {
    if (keyword) {
      const matchesKeyword =
        user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword)
      if (!matchesKeyword) return false
    }

    if (filters.role && user.role !== filters.role) return false
    if (filters.status && user.status !== filters.status) return false
    if (filters.dateFrom && user.createdAt < filters.dateFrom) return false
    if (filters.dateTo && user.createdAt > filters.dateTo) return false

    return true
  })
}
