import { hashPassword } from '../../lib/password.js'
import { ConflictError, NotFoundError } from '../../shared/errors.js'
import type { Role, UserStatus } from '../../shared/types.js'
import { usersRepository } from './repository.js'

type CreateUserInput = {
  name: string
  email: string
  role?: Role
  temporaryPassword: string
}

type UpdateUserInput = {
  role?: Role
  status?: UserStatus
}

export const usersService = {
  getAll: async () => {
    return usersRepository.findAll()
  },

  getById: async (id: string) => {
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundError('User not found')
    return user
  },

  create: async (input: CreateUserInput) => {
    const existing = await usersRepository.findByEmail(input.email)
    if (existing) throw new ConflictError('Email already in use')
    const passwordHash = await hashPassword(input.temporaryPassword)
    return usersRepository.create({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? 'member',
    })
  },

  update: async (id: string, input: UpdateUserInput) => {
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundError('User not found')
    return usersRepository.update(id, input)
  },
}
