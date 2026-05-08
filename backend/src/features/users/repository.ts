import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import type { NewUser, User } from '../../db/schema/index.js'

export const usersRepository = {
  findAll: async (): Promise<User[]> => {
    return db.select().from(users)
  },

  findById: async (id: string): Promise<User | undefined> => {
    const [row] = await db.select().from(users).where(eq(users.id, id))
    return row
  },

  findByEmail: async (email: string): Promise<User | undefined> => {
    const [row] = await db.select().from(users).where(eq(users.email, email))
    return row
  },

  create: async (data: NewUser): Promise<User> => {
    await db.insert(users).values(data)
    const [created] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.id as string))
    return created
  },

  update: async (
    id: string,
    data: Partial<Pick<User, 'role' | 'status'>>,
  ): Promise<User | undefined> => {
    await db.update(users).set(data).where(eq(users.id, id))
    const [updated] = await db.select().from(users).where(eq(users.id, id))
    return updated
  },

  setSetupToken: async (id: string, token: string, expiresAt: Date): Promise<void> => {
    await db
      .update(users)
      .set({ passwordResetToken: token, passwordResetExpiresAt: expiresAt })
      .where(eq(users.id, id))
  },
}
