import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { authMiddleware } from '../../shared/middleware/auth.js'
import type { HonoEnv } from '../../shared/types.js'
import { authService } from './service.js'

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['admin', 'member']),
  }),
})

const ChangePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'ログイン',
  description: 'メールアドレスとパスワードで認証し、JWT トークンを取得します。',
  request: {
    body: { content: { 'application/json': { schema: LoginBodySchema } }, required: true },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: LoginResponseSchema } },
      description: 'ログイン成功',
    },
  },
})

const changePasswordRoute = createRoute({
  method: 'post',
  path: '/change-password',
  tags: ['Auth'],
  summary: 'パスワード変更',
  description: '現在のパスワードを確認した上で、新しいパスワードに変更します。',
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: ChangePasswordBodySchema } }, required: true },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'パスワード変更成功',
    },
  },
})

export const authRoutes = new OpenAPIHono<HonoEnv>()

authRoutes.use('/change-password', authMiddleware)

authRoutes.openapi(loginRoute, async (c) => {
  const body = c.req.valid('json')
  const result = await authService.login(body)
  return c.json(result, 200)
})

authRoutes.openapi(changePasswordRoute, async (c) => {
  const body = c.req.valid('json')
  const { sub } = c.get('jwtPayload')
  await authService.changePassword({ userId: sub, ...body })
  return c.json({ success: true }, 200)
})
