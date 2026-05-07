import { sign, verify } from 'hono/jwt'
import type { JwtPayload } from '../shared/types.js'

const secret = () => process.env.JWT_SECRET ?? 'change-me-in-production'

const EXPIRES_IN = 60 * 60 * 24

export async function signToken(payload: Omit<JwtPayload, 'exp'>): Promise<string> {
  return sign({ ...payload, exp: Math.floor(Date.now() / 1000) + EXPIRES_IN }, secret(), 'HS256')
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const payload = await verify(token, secret(), 'HS256')
  return payload as unknown as JwtPayload
}
