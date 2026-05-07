import { date, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const announcements = mysqlTable('announcements', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  date: date('date', { mode: 'string' }).notNull(),
  category: mysqlEnum('category', ['important', 'info', 'maintenance']).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert
