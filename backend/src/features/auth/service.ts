import { randomBytes } from 'node:crypto'
import { sendPasswordResetEmail } from '../../lib/email.js'
import { signToken } from '../../lib/jwt.js'
import { comparePassword, hashPassword } from '../../lib/password.js'
import { BadRequestError, UnauthorizedError } from '../../shared/errors.js'
import { authRepository } from './repository.js'

type LoginInput = { email: string; password: string }
type ChangePasswordInput = { userId: string; currentPassword: string; newPassword: string }
type RequestResetInput = { email: string }
type ConfirmResetInput = { token: string; password: string }

const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000 // 1 hour

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
    if (input.newPassword.length < 8)
      throw new BadRequestError('Password must be at least 8 characters')
    const passwordHash = await hashPassword(input.newPassword)
    await authRepository.updatePasswordHash(user.id, passwordHash)
  },

  requestPasswordReset: async (input: RequestResetInput): Promise<void> => {
    const user = await authRepository.findByEmail(input.email)
    // セキュリティのため、メールが存在しない場合も正常終了
    if (!user || user.status === 'inactive') return
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS)
    await authRepository.setResetToken(user.id, token, expiresAt)
    await sendPasswordResetEmail(user.email, token)
  },

  confirmPasswordReset: async (input: ConfirmResetInput): Promise<void> => {
    const user = await authRepository.findByResetToken(input.token)
    if (
      !user ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      throw new BadRequestError('Invalid or expired reset token')
    }
    if (input.password.length < 8)
      throw new BadRequestError('Password must be at least 8 characters')
    const passwordHash = await hashPassword(input.password)
    await authRepository.updatePasswordHash(user.id, passwordHash)
    await authRepository.clearResetToken(user.id)
  },
}
