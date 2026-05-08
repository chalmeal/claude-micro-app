import { count, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { batchLogs, batchRuns, batches } from '../../db/schema/index.js'
import type { Batch, BatchLog, BatchRun, NewBatch } from '../../db/schema/index.js'
import type { BatchSchedule } from '../../shared/types.js'

export const batchesRepository = {
  findAll: async (): Promise<Batch[]> => {
    return db.select().from(batches)
  },

  findById: async (id: string): Promise<Batch | undefined> => {
    const [row] = await db.select().from(batches).where(eq(batches.id, id))
    return row
  },

  create: async (data: NewBatch): Promise<Batch> => {
    await db.insert(batches).values(data)
    const [created] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, data.id as string))
    return created
  },

  updateEnabled: async (id: string, enabled: boolean): Promise<Batch | undefined> => {
    await db.update(batches).set({ enabled }).where(eq(batches.id, id))
    const [updated] = await db.select().from(batches).where(eq(batches.id, id))
    return updated
  },

  updateSchedule: async (id: string, schedule: BatchSchedule): Promise<Batch | undefined> => {
    await db.update(batches).set({ schedule }).where(eq(batches.id, id))
    const [updated] = await db.select().from(batches).where(eq(batches.id, id))
    return updated
  },

  updateStatus: async (
    id: string,
    data: Partial<Pick<Batch, 'status' | 'lastRunAt' | 'lastDuration' | 'nextRunAt'>>,
  ): Promise<void> => {
    await db.update(batches).set(data).where(eq(batches.id, id))
  },

  findRuns: async (batchId: string, offset: number, limit: number): Promise<BatchRun[]> => {
    return db
      .select()
      .from(batchRuns)
      .where(eq(batchRuns.batchId, batchId))
      .orderBy(desc(batchRuns.startedAt))
      .limit(limit)
      .offset(offset)
  },

  countRuns: async (batchId: string): Promise<number> => {
    const [row] = await db
      .select({ value: count() })
      .from(batchRuns)
      .where(eq(batchRuns.batchId, batchId))
    return row?.value ?? 0
  },

  createRun: async (batchId: string): Promise<BatchRun> => {
    const id = crypto.randomUUID()
    await db.insert(batchRuns).values({ id, batchId })
    const [run] = await db.select().from(batchRuns).where(eq(batchRuns.id, id))
    return run
  },

  finishRun: async (
    runId: string,
    status: 'success' | 'failed',
    duration: number,
  ): Promise<void> => {
    await db
      .update(batchRuns)
      .set({ finishedAt: new Date(), status, duration })
      .where(eq(batchRuns.id, runId))
  },

  findLogs: async (batchRunId: string): Promise<BatchLog[]> => {
    return db.select().from(batchLogs).where(eq(batchLogs.batchRunId, batchRunId))
  },

  createLog: async (
    batchRunId: string,
    level: 'info' | 'warn' | 'error',
    message: string,
  ): Promise<void> => {
    const timestamp = new Date().toTimeString().slice(0, 8)
    await db.insert(batchLogs).values({
      id: crypto.randomUUID(),
      batchRunId,
      timestamp,
      level,
      message,
    })
  },
}
