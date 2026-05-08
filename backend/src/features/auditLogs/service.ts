import type { AuditAction } from '../../shared/types.js'
import { auditLogsRepository } from './repository.js'

type LogInput = {
  userId: string
  userEmail: string
  action: AuditAction
  targetType?: string
  targetId?: string
  detail?: Record<string, unknown>
}

type ListQuery = {
  page: number
  limit: number
  action?: string
  userId?: string
  from?: string
  to?: string
}

export const auditLogsService = {
  log: async (input: LogInput) => {
    await auditLogsRepository.create({
      userId: input.userId,
      userEmail: input.userEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      detail: input.detail,
    })
  },

  getAll: async ({ page, limit, action, userId, from, to }: ListQuery) => {
    const offset = (page - 1) * limit
    return auditLogsRepository.findAll({
      offset,
      limit,
      action,
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })
  },
}
