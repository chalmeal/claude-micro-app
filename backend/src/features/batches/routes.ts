import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { adminMiddleware, authMiddleware } from '../../shared/middleware/auth.js'
import type { HonoEnv } from '../../shared/types.js'
import { batchesService } from './service.js'

const ScheduleSchema = z.object({
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
})

const BatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['success', 'failed', 'running', 'pending']),
  schedule: ScheduleSchema,
  lastRunAt: z.date().nullable(),
  lastDuration: z.number().int().nullable(),
  nextRunAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const BatchRunSchema = z.object({
  id: z.string(),
  batchId: z.string(),
  startedAt: z.date(),
  finishedAt: z.date().nullable(),
  status: z.enum(['success', 'failed', 'running']),
  duration: z.number().int().nullable(),
  createdAt: z.date(),
})

const BatchLogSchema = z.object({
  id: z.string(),
  batchRunId: z.string(),
  timestamp: z.string(),
  level: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  createdAt: z.date(),
})

const security = [{ bearerAuth: [] }]

const listBatchesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Batches'],
  summary: 'バッチ一覧取得',
  description: '全バッチジョブの一覧を返します。管理者のみアクセス可能です。',
  security,
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(BatchSchema) } },
      description: 'バッチ一覧',
    },
  },
})

const getBatchRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Batches'],
  summary: 'バッチ取得',
  description: '指定した ID のバッチジョブを返します。管理者のみアクセス可能です。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: BatchSchema } },
      description: 'バッチ情報',
    },
  },
})

const getBatchRunsRoute = createRoute({
  method: 'get',
  path: '/{id}/runs',
  tags: ['Batches'],
  summary: 'バッチ実行履歴取得',
  description: '指定したバッチジョブの実行履歴一覧を返します。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(BatchRunSchema) } },
      description: 'バッチ実行履歴一覧',
    },
  },
})

const getBatchRunLogsRoute = createRoute({
  method: 'get',
  path: '/runs/{runId}/logs',
  tags: ['Batches'],
  summary: 'バッチ実行ログ取得',
  description: '指定したバッチ実行の詳細ログ一覧を返します。',
  security,
  request: { params: z.object({ runId: z.string() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(BatchLogSchema) } },
      description: 'バッチ実行ログ一覧',
    },
  },
})

const updateBatchScheduleRoute = createRoute({
  method: 'put',
  path: '/{id}/schedule',
  tags: ['Batches'],
  summary: 'バッチスケジュール更新',
  description: '指定したバッチジョブの実行スケジュールを更新します。管理者のみ実行可能です。',
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: ScheduleSchema } }, required: true },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: BatchSchema } },
      description: 'スケジュール更新後のバッチ情報',
    },
  },
})

const rerunBatchRoute = createRoute({
  method: 'post',
  path: '/{id}/rerun',
  tags: ['Batches'],
  summary: 'バッチ再実行',
  description:
    '指定したバッチジョブを即時再実行します。ステータスが running に変わり、新しい実行レコードが作成されます。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    202: {
      content: {
        'application/json': {
          schema: z.object({
            batchId: z.string(),
            runId: z.string(),
            status: z.literal('running'),
          }),
        },
      },
      description: '再実行開始',
    },
  },
})

export const batchesRoutes = new OpenAPIHono<HonoEnv>()

batchesRoutes.use(authMiddleware)
batchesRoutes.use(adminMiddleware)

batchesRoutes.openapi(listBatchesRoute, async (c) => {
  const items = await batchesService.getAll()
  return c.json(items, 200)
})

batchesRoutes.openapi(getBatchRoute, async (c) => {
  const item = await batchesService.getById(c.req.param('id'))
  return c.json(item, 200)
})

batchesRoutes.openapi(getBatchRunsRoute, async (c) => {
  const runs = await batchesService.getRuns(c.req.param('id'))
  return c.json(runs, 200)
})

batchesRoutes.openapi(getBatchRunLogsRoute, async (c) => {
  const logs = await batchesService.getLogs(c.req.param('runId'))
  return c.json(logs, 200)
})

batchesRoutes.openapi(updateBatchScheduleRoute, async (c) => {
  const body = c.req.valid('json')
  const item = await batchesService.updateSchedule(c.req.param('id'), body)
  return c.json(item, 200)
})

batchesRoutes.openapi(rerunBatchRoute, async (c) => {
  const result = await batchesService.rerun(c.req.param('id'))
  return c.json(result as { batchId: string; runId: string; status: 'running' }, 202)
})
