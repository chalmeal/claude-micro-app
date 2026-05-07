import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./repository.js')
vi.mock('../../lib/password.js')

import * as password from '../../lib/password.js'
import * as repo from './repository.js'
import { usersService } from './service.js'

const mockUser = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  passwordHash: 'hash',
  role: 'member' as const,
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('usersService.create', () => {
  beforeEach(() => vi.clearAllMocks())

  it('新規ユーザーを作成できる', async () => {
    vi.mocked(repo.usersRepository.findByEmail).mockResolvedValue(undefined)
    vi.mocked(password.hashPassword).mockResolvedValue('hashed')
    vi.mocked(repo.usersRepository.create).mockResolvedValue(mockUser)

    const result = await usersService.create({
      name: 'Alice',
      email: 'alice@example.com',
      temporaryPassword: 'password123',
    })

    expect(result.email).toBe('alice@example.com')
    expect(repo.usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'alice@example.com',
        passwordHash: 'hashed',
        role: 'member',
      }),
    )
  })

  it('メール重複 → ConflictError', async () => {
    vi.mocked(repo.usersRepository.findByEmail).mockResolvedValue(mockUser)

    await expect(
      usersService.create({
        name: 'Bob',
        email: 'alice@example.com',
        temporaryPassword: 'password123',
      }),
    ).rejects.toThrow('Email already in use')
  })
})

describe('usersService.getById', () => {
  it('存在しない ID → NotFoundError', async () => {
    vi.mocked(repo.usersRepository.findById).mockResolvedValue(undefined)

    await expect(usersService.getById('no-such-id')).rejects.toThrow('User not found')
  })
})

describe('usersService.update', () => {
  it('存在しない ID → NotFoundError', async () => {
    vi.mocked(repo.usersRepository.findById).mockResolvedValue(undefined)

    await expect(usersService.update('no-such-id', { role: 'admin' })).rejects.toThrow(
      'User not found',
    )
  })

  it('role と status を更新できる', async () => {
    vi.mocked(repo.usersRepository.findById).mockResolvedValue(mockUser)
    vi.mocked(repo.usersRepository.update).mockResolvedValue({
      ...mockUser,
      role: 'admin',
      status: 'inactive',
    })

    const result = await usersService.update('user-1', { role: 'admin', status: 'inactive' })

    expect(result?.role).toBe('admin')
    expect(repo.usersRepository.update).toHaveBeenCalledWith('user-1', {
      role: 'admin',
      status: 'inactive',
    })
  })
})
