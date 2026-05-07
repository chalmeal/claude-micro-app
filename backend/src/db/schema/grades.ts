import { int, mysqlEnum, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const grades = mysqlTable('grades', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  studentId: varchar('student_id', { length: 36 }).notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  score: int('score').notNull(),
  letter: mysqlEnum('letter', ['S', 'A', 'B', 'C', 'D', 'F']).notNull(),
  year: int('year').notNull(),
  semester: mysqlEnum('semester', ['spring', 'fall']).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export type Grade = typeof grades.$inferSelect
export type NewGrade = typeof grades.$inferInsert
