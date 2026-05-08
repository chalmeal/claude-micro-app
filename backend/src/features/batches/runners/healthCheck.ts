import { sql } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { batchesRepository } from '../repository.js'

export async function runHealthCheck(batchId: string): Promise<void> {
  const startedAt = Date.now()
  await batchesRepository.updateStatus(batchId, { status: 'running' })
  const run = await batchesRepository.createRun(batchId)

  let status: 'success' | 'failed' = 'success'
  try {
    await batchesRepository.createLog(run.id, 'info', 'ヘルスチェック開始: SELECT 1 を実行します')
    await db.execute(sql`SELECT 1`)
    await batchesRepository.createLog(run.id, 'info', 'DBサーバー正常: SELECT 1 成功')
  } catch (err) {
    status = 'failed'
    const message = err instanceof Error ? err.message : String(err)
    await batchesRepository.createLog(run.id, 'error', `DBエラー: ${message}`)
  }

  const duration = Math.round((Date.now() - startedAt) / 1000)
  await batchesRepository.finishRun(run.id, status, duration)
  await batchesRepository.updateStatus(batchId, {
    status,
    lastRunAt: new Date(),
    lastDuration: duration,
    nextRunAt: new Date(Date.now() + 60_000),
  })
}
