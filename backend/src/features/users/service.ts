import { randomBytes } from 'node:crypto'
import { sendInitialSetupEmail } from '../../lib/email.js'
import { hashPassword } from '../../lib/password.js'
import { ConflictError, NotFoundError } from '../../shared/errors.js'
import type { Role, UserStatus } from '../../shared/types.js'
import { usersRepository } from './repository.js'

type CreateUserInput = {
  name: string
  email: string
  role?: Role
}

type UpdateUserInput = {
  role?: Role
  status?: UserStatus
}

const SETUP_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

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
    const placeholderHash = await hashPassword(randomBytes(32).toString('hex'))
    const userId = crypto.randomUUID()
    const user = await usersRepository.create({
      id: userId,
      name: input.name,
      email: input.email,
      passwordHash: placeholderHash,
      role: input.role ?? 'member',
    })
    const setupToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + SETUP_TOKEN_EXPIRES_MS)
    await usersRepository.setSetupToken(userId, setupToken, expiresAt)
    await sendInitialSetupEmail(input.email, setupToken)
    return user
  },

  update: async (id: string, input: UpdateUserInput) => {
    const user = await usersRepository.findById(id)
    if (!user) throw new NotFoundError('User not found')
    return usersRepository.update(id, input)
  },
}
