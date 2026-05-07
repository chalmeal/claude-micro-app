import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { grades } from '../../db/schema/index.js'
import type { Grade, NewGrade } from '../../db/schema/index.js'

export const gradesRepository = {
  findAll: async (): Promise<Grade[]> => {
    return db.select().from(grades)
  },

  findById: async (id: string): Promise<Grade | undefined> => {
    const [row] = await db.select().from(grades).where(eq(grades.id, id))
    return row
  },

  findByStudentSubjectYearSemester: async (
    studentId: string,
    subject: string,
    year: number,
    semester: 'spring' | 'fall',
  ): Promise<Grade | undefined> => {
    const [row] = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.studentId, studentId),
          eq(grades.subject, subject),
          eq(grades.year, year),
          eq(grades.semester, semester),
        ),
      )
    return row
  },

  create: async (data: NewGrade): Promise<Grade> => {
    await db.insert(grades).values(data)
    const [created] = await db
      .select()
      .from(grades)
      .where(eq(grades.id, data.id as string))
    return created
  },

  update: async (
    id: string,
    data: Partial<Pick<Grade, 'score' | 'letter'>>,
  ): Promise<Grade | undefined> => {
    await db.update(grades).set(data).where(eq(grades.id, id))
    const [updated] = await db.select().from(grades).where(eq(grades.id, id))
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(grades).where(eq(grades.id, id))
  },
}
