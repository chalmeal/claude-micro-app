import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { auditLogsService } from '../auditLogs/service.js'
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

const RequestResetBodySchema = z.object({
  email: z.string().email(),
})

const ConfirmResetBodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
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

const requestResetRoute = createRoute({
  method: 'post',
  path: '/reset-password/request',
  tags: ['Auth'],
  summary: 'パスワードリセット要求',
  description:
    'メールアドレスが登録済みの場合、パスワード再設定用リンクをメール送信します。未登録の場合も同じ 200 を返します。',
  request: {
    body: { content: { 'application/json': { schema: RequestResetBodySchema } }, required: true },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'リクエスト受付完了',
    },
  },
})

const confirmResetRoute = createRoute({
  method: 'post',
  path: '/reset-password/confirm',
  tags: ['Auth'],
  summary: 'パスワードリセット確定',
  description: 'リセットトークンと新しいパスワードを受け取り、パスワードを更新します。',
  request: {
    body: { content: { 'application/json': { schema: ConfirmResetBodySchema } }, required: true },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'パスワード更新成功',
    },
  },
})

export const authRoutes = new OpenAPIHono<HonoEnv>()

authRoutes.use('/change-password', authMiddleware)

authRoutes.openapi(loginRoute, async (c) => {
  const body = c.req.valid('json')
  const result = await authService.login(body)
  auditLogsService
    .log({
      userId: result.user.id,
      userEmail: result.user.email,
      action: 'auth.login',
    })
    .catch(() => {})
  return c.json(result, 200)
})

authRoutes.openapi(changePasswordRoute, async (c) => {
  const body = c.req.valid('json')
  const { sub, email } = c.get('jwtPayload')
  await authService.changePassword({ userId: sub, ...body })
  auditLogsService
    .log({ userId: sub, userEmail: email, action: 'auth.change_password' })
    .catch(() => {})
  return c.json({ success: true }, 200)
})

authRoutes.openapi(requestResetRoute, async (c) => {
  const body = c.req.valid('json')
  await authService.requestPasswordReset(body)
  return c.json({ success: true }, 200)
})

authRoutes.openapi(confirmResetRoute, async (c) => {
  const body = c.req.valid('json')
  await authService.confirmPasswordReset(body)
  return c.json({ success: true }, 200)
})
