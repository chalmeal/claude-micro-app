import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { authMiddleware } from '../../shared/middleware/auth.js'
import type { HonoEnv } from '../../shared/types.js'
import { gradesService } from './service.js'

const GradeSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  subject: z.string(),
  score: z.number().int(),
  letter: z.enum(['S', 'A', 'B', 'C', 'D', 'F']),
  year: z.number().int(),
  semester: z.enum(['spring', 'fall']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const security = [{ bearerAuth: [] }]

const listGradesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Grades'],
  summary: '成績一覧取得',
  description: '全成績レコードの一覧を返します。',
  security,
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(GradeSchema) } },
      description: '成績一覧',
    },
  },
})

const getGradeRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Grades'],
  summary: '成績取得',
  description: '指定した ID の成績レコードを返します。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: GradeSchema } },
      description: '成績情報',
    },
  },
})

const createGradeRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Grades'],
  summary: '成績登録',
  description:
    '学生の成績を新規登録します。スコアに応じて評価（S/A/B/C/D/F）が自動で付与されます。',
  security,
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            studentId: z.string().min(1),
            studentName: z.string().min(1),
            subject: z.string().min(1),
            score: z.number().int().min(0).max(100),
            year: z.number().int().min(2000),
            semester: z.enum(['spring', 'fall']),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: GradeSchema } },
      description: '登録された成績',
    },
  },
})

const updateGradeRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Grades'],
  summary: '成績更新',
  description: '指定した ID の成績スコアを更新します。評価も再計算されます。',
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': { schema: z.object({ score: z.number().int().min(0).max(100) }) },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: GradeSchema } },
      description: '更新された成績',
    },
  },
})

const deleteGradeRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Grades'],
  summary: '成績削除',
  description: '指定した ID の成績レコードを削除します。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: '削除成功' },
  },
})

export const gradesRoutes = new OpenAPIHono<HonoEnv>()

gradesRoutes.use(authMiddleware)

gradesRoutes.openapi(listGradesRoute, async (c) => {
  const grades = await gradesService.getAll()
  return c.json(grades, 200)
})

gradesRoutes.openapi(getGradeRoute, async (c) => {
  const grade = await gradesService.getById(c.req.param('id'))
  return c.json(grade, 200)
})

gradesRoutes.openapi(createGradeRoute, async (c) => {
  const body = c.req.valid('json')
  const grade = await gradesService.create(body)
  return c.json(grade, 201)
})

gradesRoutes.openapi(updateGradeRoute, async (c) => {
  const { score } = c.req.valid('json')
  const grade = await gradesService.update(c.req.param('id'), score)
  return c.json(grade, 200)
})

gradesRoutes.openapi(deleteGradeRoute, async (c) => {
  await gradesService.delete(c.req.param('id'))
  return c.body(null, 204)
})
