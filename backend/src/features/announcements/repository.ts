import { desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { announcements } from '../../db/schema/index.js'
import type { Announcement, NewAnnouncement } from '../../db/schema/index.js'

export const announcementsRepository = {
  findAll: async (): Promise<Announcement[]> => {
    return db.select().from(announcements).orderBy(desc(announcements.date))
  },

  findRecent: async (limit: number): Promise<Announcement[]> => {
    return db.select().from(announcements).orderBy(desc(announcements.date)).limit(limit)
  },

  findById: async (id: string): Promise<Announcement | undefined> => {
    const [row] = await db.select().from(announcements).where(eq(announcements.id, id))
    return row
  },

  create: async (data: NewAnnouncement): Promise<Announcement> => {
    await db.insert(announcements).values(data)
    const [created] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, data.id as string))
    return created
  },

  update: async (
    id: string,
    data: Partial<Pick<Announcement, 'title' | 'body' | 'date' | 'category'>>,
  ): Promise<Announcement | undefined> => {
    await db.update(announcements).set(data).where(eq(announcements.id, id))
    const [updated] = await db.select().from(announcements).where(eq(announcements.id, id))
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(announcements).where(eq(announcements.id, id))
  },
}
