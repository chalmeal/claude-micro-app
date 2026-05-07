import type { ErrorHandler } from 'hono'
import { AppError } from '../errors.js'

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
}
