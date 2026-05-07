import { apiFetch } from '@/shared/api/client'
import type { BatchJob, BatchLogEntry, BatchRun, BatchSchedule } from '@/features/admin/types'

type ApiBatch = {
  id: string
  name: string
  description: string
  status: BatchJob['status']
  schedule: BatchSchedule
  lastRunAt: string | null
  lastDuration: number | null
  nextRunAt: string | null
  createdAt: string
  updatedAt: string
}

type ApiBatchRun = {
  id: string
  batchId: string
  startedAt: string
  finishedAt: string | null
  status: BatchRun['status']
  duration: number | null
  createdAt: string
}

type ApiBatchLog = {
  id: string
  batchRunId: string
  timestamp: string
  level: BatchLogEntry['level']
  message: string
  createdAt: string
}

function toBatchJob(b: ApiBatch): BatchJob {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    status: b.status,
    schedule: b.schedule,
    lastRunAt: b.lastRunAt,
    lastDuration: b.lastDuration,
    nextRunAt: b.nextRunAt,
  }
}

export async function getBatches(signal?: AbortSignal): Promise<BatchJob[]> {
  const data = await apiFetch<ApiBatch[]>('/batches', { signal })
  return data.map(toBatchJob)
}

export async function getBatchRuns(batchId: string): Promise<BatchRun[]> {
  const runs = await apiFetch<ApiBatchRun[]>(`/batches/${batchId}/runs`)

  const runsWithLogs = await Promise.all(
    runs.map(async (run) => {
      const logs = await apiFetch<ApiBatchLog[]>(`/batches/runs/${run.id}/logs`)
      const batchRun: BatchRun = {
        id: run.id,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        status: run.status,
        duration: run.duration,
        logs: logs.map((l) => ({ timestamp: l.timestamp, level: l.level, message: l.message })),
      }
      return batchRun
    }),
  )

  return runsWithLogs
}

export async function rerunBatch(batchId: string): Promise<void> {
  await apiFetch(`/batches/${batchId}/rerun`, { method: 'POST' })
}

export async function updateBatchSchedule(batchId: string, schedule: BatchSchedule): Promise<void> {
  await apiFetch(`/batches/${batchId}/schedule`, {
    method: 'PUT',
    body: JSON.stringify(schedule),
  })
}
