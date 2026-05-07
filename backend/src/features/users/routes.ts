import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { adminMiddleware, authMiddleware } from '../../shared/middleware/auth.js'
import type { HonoEnv } from '../../shared/types.js'
import { usersService } from './service.js'

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'inactive']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const security = [{ bearerAuth: [] }]

const listUsersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Users'],
  summary: 'ユーザー一覧取得',
  description: '全ユーザーの一覧を返します。管理者のみアクセス可能です。',
  security,
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(UserSchema) } },
      description: 'ユーザー一覧',
    },
  },
})

const getUserRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Users'],
  summary: 'ユーザー取得',
  description: '指定した ID のユーザーを返します。管理者のみアクセス可能です。',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: UserSchema } },
      description: 'ユーザー情報',
    },
  },
})

const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Users'],
  summary: 'ユーザー作成',
  description: '新規ユーザーを作成します。初期パスワードは一時パスワードとして設定されます。管理者のみ実行可能です。',
  security,
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1),
            email: z.string().email(),
            role: z.enum(['admin', 'member']).optional(),
            temporaryPassword: z.string().min(8),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: UserSchema } },
      description: '作成されたユーザー',
    },
  },
})

const updateUserRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Users'],
  summary: 'ユーザー更新',
  description: '指定した ID のユーザーのロールまたはステータスを更新します。管理者のみ実行可能です。',
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            role: z.enum(['admin', 'member']).optional(),
            status: z.enum(['active', 'inactive']).optional(),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: UserSchema } },
      description: '更新されたユーザー',
    },
  },
})

export const usersRoutes = new OpenAPIHono<HonoEnv>()

usersRoutes.use(authMiddleware)
usersRoutes.use(adminMiddleware)

usersRoutes.openapi(listUsersRoute, async (c) => {
  const users = await usersService.getAll()
  return c.json(users, 200)
})

usersRoutes.openapi(getUserRoute, async (c) => {
  const user = await usersService.getById(c.req.param('id'))
  return c.json(user, 200)
})

usersRoutes.openapi(createUserRoute, async (c) => {
  const body = c.req.valid('json')
  const user = await usersService.create(body)
  return c.json(user, 201)
})

usersRoutes.openapi(updateUserRoute, async (c) => {
  const body = c.req.valid('json')
  const user = await usersService.update(c.req.param('id'), body)
  return c.json(user, 200)
})
