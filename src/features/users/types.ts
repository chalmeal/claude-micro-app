export type UserRole = 'admin' | 'member'

export type UserStatus = 'active' | 'inactive'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export type UserFilters = {
  keyword: string
  role: UserRole | ''
  status: UserStatus | ''
  dateFrom: string
  dateTo: string
}

export type CreateUserInput = {
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

export type UpdateUserPatch = {
  role?: UserRole
  status?: UserStatus
}

export const emptyUserFilters: UserFilters = {
  keyword: '',
  role: '',
  status: '',
  dateFrom: '',
  dateTo: '',
}
