import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: [
    './src/db/schema/users.ts',
    './src/db/schema/grades.ts',
    './src/db/schema/announcements.ts',
    './src/db/schema/batches.ts',
    './src/db/schema/auditLogs.ts',
  ],
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'app',
  },
})
