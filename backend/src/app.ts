import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { announcementsRoutes } from './features/announcements/routes.js'
import { auditLogsRoutes } from './features/auditLogs/routes.js'
import { authRoutes } from './features/auth/routes.js'
import { batchesRoutes } from './features/batches/routes.js'
import { gradesRoutes } from './features/grades/routes.js'
import { usersRoutes } from './features/users/routes.js'
import { errorHandler } from './shared/middleware/error.js'

export function createApp() {
  const app = new OpenAPIHono()

  app.use(logger())
  app.use(secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  }))
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))

  app.get('/health', (c) => c.json({ status: 'ok' }))

  app.route('/api/auth', authRoutes)
  app.route('/api/users', usersRoutes)
  app.route('/api/grades', gradesRoutes)
  app.route('/api/announcements', announcementsRoutes)
  app.route('/api/batches', batchesRoutes)
  app.route('/api/audit-logs', auditLogsRoutes)

  app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  })

  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: { title: 'Claude Micro App API', version: '1.0.0' },
  })

  app.get('/docs', swaggerUI({ url: '/openapi.json' }))

  app.onError(errorHandler)

  return app
}
