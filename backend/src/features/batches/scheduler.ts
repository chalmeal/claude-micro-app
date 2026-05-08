import { batchesRepository } from './repository.js'
import { runHealthCheck } from './runners/healthCheck.js'

type BatchRunner = (batchId: string) => Promise<void>

const RUNNERS: Record<string, BatchRunner> = {
  '死活監視バッチ': runHealthCheck,
}

const running = new Set<string>()

async function tick(): Promise<void> {
  const allBatches = await batchesRepository.findAll()
  const minutelyBatches = allBatches.filter(
    (b) => b.enabled && b.schedule.frequency === 'minutely',
  )

  for (const batch of minutelyBatches) {
    if (running.has(batch.id)) continue
    const runner = RUNNERS[batch.name]
    if (!runner) continue

    running.add(batch.id)
    runner(batch.id)
      .catch((err) => console.error(`[scheduler] ${batch.name} error:`, err))
      .finally(() => running.delete(batch.id))
  }
}

export function startScheduler(): void {
  tick().catch((err) => console.error('[scheduler] tick error:', err))
  setInterval(() => tick().catch((err) => console.error('[scheduler] tick error:', err)), 60_000)
  console.log('[scheduler] started')
}
