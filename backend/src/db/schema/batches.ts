import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core'

export type BatchSchedule = {
  frequency: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
}

export const batches = mysqlTable('batches', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }).notNull().default(''),
  status: mysqlEnum('status', ['success', 'failed', 'running', 'pending'])
    .notNull()
    .default('pending'),
  schedule: json('schedule').$type<BatchSchedule>().notNull(),
  lastRunAt: timestamp('last_run_at'),
  lastDuration: int('last_duration'),
  nextRunAt: timestamp('next_run_at'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export const batchRuns = mysqlTable(
  'batch_runs',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    batchId: varchar('batch_id', { length: 36 })
      .notNull()
      .references(() => batches.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    finishedAt: timestamp('finished_at'),
    status: mysqlEnum('status', ['success', 'failed', 'running']).notNull().default('running'),
    duration: int('duration'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('batch_runs_batch_id_started_at_idx').on(t.batchId, t.startedAt)],
)

export const batchLogs = mysqlTable(
  'batch_logs',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    batchRunId: varchar('batch_run_id', { length: 36 })
      .notNull()
      .references(() => batchRuns.id, { onDelete: 'cascade' }),
    timestamp: varchar('timestamp', { length: 8 }).notNull(),
    level: mysqlEnum('level', ['info', 'warn', 'error']).notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('batch_logs_batch_run_id_idx').on(t.batchRunId)],
)

export type Batch = typeof batches.$inferSelect
export type NewBatch = typeof batches.$inferInsert
export type BatchRun = typeof batchRuns.$inferSelect
export type BatchLog = typeof batchLogs.$inferSelect
