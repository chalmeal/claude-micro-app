import 'dotenv/config'
import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { startScheduler } from './features/batches/scheduler.js'

const app = createApp()
const PORT = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  startScheduler()
})
