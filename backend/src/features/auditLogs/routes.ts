import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { adminMiddleware, authMiddleware } from '../../shared/middleware/auth.js'
import type { HonoEnv } from '../../shared/types.js'
import { auditLogsService } from './service.js'

const AuditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  action: z.string(),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  detail: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
})

const security = [{ bearerAuth: [] }]

const listAuditLogsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['AuditLogs'],
  summary: '監査ログ一覧取得',
  description: '管理操作の監査ログをページネーション付きで返します。管理者のみアクセス可能です。',
  security,
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(30),
      action: z.string().optional(),
      userId: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            items: z.array(AuditLogSchema),
            total: z.number().int(),
          }),
        },
      },
      description: '監査ログ一覧',
    },
  },
})

export const auditLogsRoutes = new OpenAPIHono<HonoEnv>()

auditLogsRoutes.use(authMiddleware)
auditLogsRoutes.use(adminMiddleware)

auditLogsRoutes.openapi(listAuditLogsRoute, async (c) => {
  const query = c.req.valid('query')
  const result = await auditLogsService.getAll(query)
  return c.json(result, 200)
})
