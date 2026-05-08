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
  enabled: boolean
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
    enabled: b.enabled,
  }
}

export async function getBatches(signal?: AbortSignal): Promise<BatchJob[]> {
  const data = await apiFetch<ApiBatch[]>('/batches', { signal })
  return data.map(toBatchJob)
}

export async function getBatchRuns(
  batchId: string,
  offset: number,
  limit: number,
  signal?: AbortSignal,
): Promise<{ items: BatchRun[]; total: number }> {
  const data = await apiFetch<{ items: ApiBatchRun[]; total: number }>(
    `/batches/${batchId}/runs?offset=${offset}&limit=${limit}`,
    { signal },
  )
  return {
    items: data.items.map((run) => ({
      id: run.id,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      status: run.status,
      duration: run.duration,
    })),
    total: data.total,
  }
}

export async function getBatchRunLogs(runId: string): Promise<BatchLogEntry[]> {
  const logs = await apiFetch<ApiBatchLog[]>(`/batches/runs/${runId}/logs`)
  return logs.map((l) => ({ timestamp: l.timestamp, level: l.level, message: l.message }))
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

export async function updateBatchEnabled(batchId: string, enabled: boolean): Promise<BatchJob> {
  const data = await apiFetch<ApiBatch>(`/batches/${batchId}/enabled`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  })
  return toBatchJob(data)
}
