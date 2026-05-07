import { signToken } from '../../lib/jwt.js'
import { comparePassword, hashPassword } from '../../lib/password.js'
import { BadRequestError, UnauthorizedError } from '../../shared/errors.js'
import { authRepository } from './repository.js'

type LoginInput = { email: string; password: string }
type ChangePasswordInput = { userId: string; currentPassword: string; newPassword: string }

export const authService = {
  login: async (input: LoginInput) => {
    const user = await authRepository.findByEmail(input.email)
    if (!user || user.status === 'inactive') {
      throw new UnauthorizedError('Invalid email or password')
    }
    const valid = await comparePassword(input.password, user.passwordHash)
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password')
    }
    const token = await signToken({ sub: user.id, email: user.email, role: user.role })
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }
  },

  changePassword: async (input: ChangePasswordInput) => {
    const user = await authRepository.findById(input.userId)
    if (!user) throw new UnauthorizedError()
    const valid = await comparePassword(input.currentPassword, user.passwordHash)
    if (!valid) throw new BadRequestError('Current password is incorrect')
    if (input.newPassword.length < 8) throw new BadRequestError('Password must be at least 8 characters')
    const passwordHash = await hashPassword(input.newPassword)
    await authRepository.updatePasswordHash(user.id, passwordHash)
  },
}
