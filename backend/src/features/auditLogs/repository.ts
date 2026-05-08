import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { auditLogs } from '../../db/schema/index.js'
import type { NewAuditLog } from '../../db/schema/auditLogs.js'

type ListQuery = {
  offset: number
  limit: number
  action?: string
  userId?: string
  from?: Date
  to?: Date
}

export const auditLogsRepository = {
  create: async (entry: NewAuditLog) => {
    await db.insert(auditLogs).values(entry)
  },

  findAll: async ({ offset, limit, action, userId, from, to }: ListQuery) => {
    const where = and(
      action ? eq(auditLogs.action, action) : undefined,
      userId ? eq(auditLogs.userId, userId) : undefined,
      from ? gte(auditLogs.createdAt, from) : undefined,
      to ? lte(auditLogs.createdAt, to) : undefined,
    )

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(auditLogs).where(where),
    ])

    return { items, total }
  },
}
