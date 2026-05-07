import { NotFoundError } from '../../shared/errors.js'
import type { BatchSchedule } from '../../shared/types.js'
import { batchesRepository } from './repository.js'

export const batchesService = {
  getAll: async () => {
    return batchesRepository.findAll()
  },

  getById: async (id: string) => {
    const batch = await batchesRepository.findById(id)
    if (!batch) throw new NotFoundError('Batch not found')
    return batch
  },

  getRuns: async (batchId: string) => {
    await batchesService.getById(batchId)
    return batchesRepository.findRuns(batchId)
  },

  getLogs: async (batchRunId: string) => {
    return batchesRepository.findLogs(batchRunId)
  },

  updateSchedule: async (id: string, schedule: BatchSchedule) => {
    const batch = await batchesRepository.findById(id)
    if (!batch) throw new NotFoundError('Batch not found')
    return batchesRepository.updateSchedule(id, schedule)
  },

  rerun: async (id: string) => {
    const batch = await batchesRepository.findById(id)
    if (!batch) throw new NotFoundError('Batch not found')
    await batchesRepository.updateStatus(id, { status: 'running' })
    const run = await batchesRepository.createRun(id)
    return { batchId: id, runId: run.id, status: 'running' }
  },
}
