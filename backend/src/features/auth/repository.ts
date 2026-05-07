import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema/index.js'
import type { User } from '../../db/schema/index.js'

export const authRepository = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const [row] = await db.select().from(users).where(eq(users.email, email))
    return row
  },

  findById: async (id: string): Promise<User | undefined> => {
    const [row] = await db.select().from(users).where(eq(users.id, id))
    return row
  },

  updatePasswordHash: async (id: string, passwordHash: string): Promise<void> => {
    await db.update(users).set({ passwordHash }).where(eq(users.id, id))
  },
}
