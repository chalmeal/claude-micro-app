import { drizzle } from 'drizzle-orm/mysql2'
import { createPool } from 'mysql2/promise'

const pool = createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'app',
})

export const db = drizzle(pool)
export type DB = typeof db
