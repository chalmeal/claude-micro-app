import { BadRequestError, NotFoundError } from '../../shared/errors.js'
import type { BatchSchedule } from '../../shared/types.js'
import { batchesRepository } from './repository.js'
import { runBatch } from './scheduler.js'

export const batchesService = {
  getAll: async () => {
    return batchesRepository.findAll()
  },

  getById: async (id: string) => {
    const batch = await batchesRepository.findById(id)
    if (!batch) throw new NotFoundError('Batch not found')
    return batch
  },

  getRuns: async (batchId: string, offset: number, limit: number) => {
    const [items, total] = await Promise.all([
      batchesRepository.findRuns(batchId, offset, limit),
      batchesRepository.countRuns(batchId),
    ])
    return { items, total }
  },

  getLogs: async (batchRunId: string) => {
    return batchesRepository.findLogs(batchRunId)
  },

  updateEnabled: async (id: string, enabled: boolean) => {
    const batch = await batchesRepository.findById(id)
    if (!batch) throw new NotFoundError('Batch not found')
    return batchesRepository.updateEnabled(id, enabled)
  },

  updateSchedule: async (id: string, schedule: BatchSchedule) => {
    const batch = await batchesRepository.findById(id)
    if (!batch) throw new NotFoundError('Batch not found')
    return batchesRepository.updateSchedule(id, schedule)
  },

  rerun: async (id: string) => {
    const batch = await batchesRepository.findById(id)
    if (!batch) throw new NotFoundError('Batch not found')
    try {
      await runBatch(id, batch.name)
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('No runner')) {
        throw new BadRequestError(err.message)
      }
      throw err
    }
    const updated = await batchesRepository.findById(id)
    const [latestRun] = await batchesRepository.findRuns(id, 0, 1)
    return { batchId: id, runId: latestRun?.id ?? '', status: updated?.status ?? 'success' }
  },
}
