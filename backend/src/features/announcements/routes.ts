import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { adminMiddleware, authMiddleware } from '../../shared/middleware/auth.js'
import type { HonoEnv } from '../../shared/types.js'
import { announcementsService } from './service.js'

const AnnouncementSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  date: z.string(),
  category: z.enum(['important', 'info', 'maintenance']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const AnnouncementBodySchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(['important', 'info', 'maintenance']),
})

const security = [{ bearerAuth: [] }]

const listAnnouncementsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Announcements'],
  summary: 'お知らせ一覧取得',
  description: 'お知らせの一覧を返します。`limit` を指定すると最新 N 件に絞り込めます。',
  security,
  request: {
    query: z.object({ limit: z.coerce.number().int().positive().optional() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(AnnouncementSchema) } },
      description: 'お知らせ一覧',
    },
  },
})

const getAnnouncementRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Announcements'],
  summary: 'お知らせ取得',
  description: '指定した ID のお知らせを返します。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: AnnouncementSchema } },
      description: 'お知らせ情報',
    },
  },
})

const createAnnouncementRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Announcements'],
  summary: 'お知らせ作成',
  description: '新規お知らせを作成します。管理者のみ実行可能です。',
  security,
  request: {
    body: { content: { 'application/json': { schema: AnnouncementBodySchema } }, required: true },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: AnnouncementSchema } },
      description: '作成されたお知らせ',
    },
  },
})

const updateAnnouncementRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Announcements'],
  summary: 'お知らせ更新',
  description: '指定した ID のお知らせを更新します。管理者のみ実行可能です。',
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: AnnouncementBodySchema.partial() } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: AnnouncementSchema } },
      description: '更新されたお知らせ',
    },
  },
})

const deleteAnnouncementRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Announcements'],
  summary: 'お知らせ削除',
  description: '指定した ID のお知らせを削除します。管理者のみ実行可能です。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: '削除成功' },
  },
})

export const announcementsRoutes = new OpenAPIHono<HonoEnv>()

announcementsRoutes.use(authMiddleware)

announcementsRoutes.openapi(listAnnouncementsRoute, async (c) => {
  const { limit } = c.req.valid('query')
  const items = limit && limit > 0
    ? await announcementsService.getRecent(limit)
    : await announcementsService.getAll()
  return c.json(items, 200)
})

announcementsRoutes.openapi(getAnnouncementRoute, async (c) => {
  const item = await announcementsService.getById(c.req.param('id'))
  return c.json(item, 200)
})

announcementsRoutes.use('/', adminMiddleware)
announcementsRoutes.use('/:id', adminMiddleware)

announcementsRoutes.openapi(createAnnouncementRoute, async (c) => {
  const body = c.req.valid('json')
  const item = await announcementsService.create(body)
  return c.json(item, 201)
})

announcementsRoutes.openapi(updateAnnouncementRoute, async (c) => {
  const body = c.req.valid('json')
  const item = await announcementsService.update(c.req.param('id'), body)
  return c.json(item, 200)
})

announcementsRoutes.openapi(deleteAnnouncementRoute, async (c) => {
  await announcementsService.delete(c.req.param('id'))
  return c.body(null, 204)
})
