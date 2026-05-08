export type BatchStatus = 'success' | 'failed' | 'running' | 'pending'
export type BatchFrequency = 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly'

export type BatchSchedule = {
  frequency: BatchFrequency
  time: string // 'HH:MM'（minutely / hourly 以外で使用）
  dayOfWeek?: number // 0=日 〜 6=土（weekly 用）
  dayOfMonth?: number // 1〜31（monthly 用）
}

export type BatchJob = {
  id: string
  name: string
  description: string
  status: BatchStatus
  lastRunAt: string | null
  lastDuration: number | null // 秒
  schedule: BatchSchedule
  nextRunAt: string | null
  enabled: boolean
}

export type BatchLogEntry = {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export type BatchRun = {
  id: string
  startedAt: string
  finishedAt: string | null
  status: Exclude<BatchStatus, 'pending'>
  duration: number | null
  logs?: BatchLogEntry[]
}
