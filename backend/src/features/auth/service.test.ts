import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./repository.js')
vi.mock('../../lib/password.js')
vi.mock('../../lib/jwt.js')

import * as jwt from '../../lib/jwt.js'
import * as password from '../../lib/password.js'
import * as repo from './repository.js'
import { authService } from './service.js'

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  role: 'member' as const,
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('authService.login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('valid credentials → token と user を返す', async () => {
    vi.mocked(repo.authRepository.findByEmail).mockResolvedValue(mockUser)
    vi.mocked(password.comparePassword).mockResolvedValue(true)
    vi.mocked(jwt.signToken).mockResolvedValue('token-abc')

    const result = await authService.login({ email: 'test@example.com', password: 'pass' })

    expect(result.token).toBe('token-abc')
    expect(result.user).toMatchObject({ id: 'user-1', email: 'test@example.com', role: 'member' })
  })

  it('存在しないメール → UnauthorizedError', async () => {
    vi.mocked(repo.authRepository.findByEmail).mockResolvedValue(undefined)

    await expect(authService.login({ email: 'no@example.com', password: 'pass' })).rejects.toThrow(
      'Invalid email or password',
    )
  })

  it('パスワード不一致 → UnauthorizedError', async () => {
    vi.mocked(repo.authRepository.findByEmail).mockResolvedValue(mockUser)
    vi.mocked(password.comparePassword).mockResolvedValue(false)

    await expect(authService.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
      'Invalid email or password',
    )
  })

  it('inactive ユーザー → UnauthorizedError', async () => {
    vi.mocked(repo.authRepository.findByEmail).mockResolvedValue({ ...mockUser, status: 'inactive' })

    await expect(authService.login({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      'Invalid email or password',
    )
  })
})

describe('authService.changePassword', () => {
  beforeEach(() => vi.clearAllMocks())

  it('現在のパスワードが間違い → BadRequestError', async () => {
    vi.mocked(repo.authRepository.findById).mockResolvedValue(mockUser)
    vi.mocked(password.comparePassword).mockResolvedValue(false)

    await expect(
      authService.changePassword({ userId: 'user-1', currentPassword: 'wrong', newPassword: 'newpass123' }),
    ).rejects.toThrow('Current password is incorrect')
  })

  it('新パスワードが8文字未満 → BadRequestError', async () => {
    vi.mocked(repo.authRepository.findById).mockResolvedValue(mockUser)
    vi.mocked(password.comparePassword).mockResolvedValue(true)

    await expect(
      authService.changePassword({ userId: 'user-1', currentPassword: 'current', newPassword: 'short' }),
    ).rejects.toThrow('Password must be at least 8 characters')
  })

  it('正常変更 → updatePasswordHash を呼ぶ', async () => {
    vi.mocked(repo.authRepository.findById).mockResolvedValue(mockUser)
    vi.mocked(password.comparePassword).mockResolvedValue(true)
    vi.mocked(password.hashPassword).mockResolvedValue('new_hash')
    vi.mocked(repo.authRepository.updatePasswordHash).mockResolvedValue()

    await authService.changePassword({ userId: 'user-1', currentPassword: 'current', newPassword: 'newpass123' })

    expect(repo.authRepository.updatePasswordHash).toHaveBeenCalledWith('user-1', 'new_hash')
  })
})
