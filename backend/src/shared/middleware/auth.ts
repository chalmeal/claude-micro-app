import type { MiddlewareHandler } from 'hono'
import { verifyToken } from '../../lib/jwt.js'
import { ForbiddenError, UnauthorizedError } from '../errors.js'
import type { HonoEnv } from '../types.js'

export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const authorization = c.req.header('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedError()
  }
  try {
    const payload = await verifyToken(authorization.slice(7))
    c.set('jwtPayload', payload)
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
  await next()
}

export const adminMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const payload = c.get('jwtPayload')
  if (payload.role !== 'admin') {
    throw new ForbiddenError()
  }
  await next()
}
