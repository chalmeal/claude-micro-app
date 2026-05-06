import type { BatchJob, BatchRun, BatchSchedule } from '@/features/admin/types'

const D = 400

// ── ストア ──────────────────────────────────────────────
let store: BatchJob[] = [
  {
    id: '1',
    name: 'ユーザーデータ同期',
    description: '外部システムからユーザー情報を取り込みます',
    status: 'success',
    lastRunAt: '2026-05-05 03:00:12',
    lastDuration: 12,
    schedule: { frequency: 'daily', time: '03:00' },
    nextRunAt: '2026-05-06 03:00:00',
  },
  {
    id: '2',
    name: '週次レポート生成',
    description: '週次集計レポートを生成してメール送信します',
    status: 'failed',
    lastRunAt: '2026-05-05 06:00:31',
    lastDuration: null,
    schedule: { frequency: 'weekly', time: '06:00', dayOfWeek: 1 },
    nextRunAt: '2026-05-12 06:00:00',
  },
  {
    id: '3',
    name: 'キャッシュクリア',
    description: 'アプリケーションキャッシュを定期的にクリアします',
    status: 'success',
    lastRunAt: '2026-05-05 09:00:03',
    lastDuration: 3,
    schedule: { frequency: 'hourly', time: '00:00' },
    nextRunAt: '2026-05-05 10:00:00',
  },
  {
    id: '4',
    name: 'メール通知送信',
    description: '未送信の通知メールをまとめて送信します',
    status: 'running',
    lastRunAt: '2026-05-05 09:30:00',
    lastDuration: null,
    schedule: { frequency: 'daily', time: '09:30' },
    nextRunAt: '2026-05-06 09:30:00',
  },
  {
    id: '5',
    name: 'データバックアップ',
    description: 'データベースのフルバックアップを取得します',
    status: 'success',
    lastRunAt: '2026-05-05 01:00:47',
    lastDuration: 47,
    schedule: { frequency: 'daily', time: '01:00' },
    nextRunAt: '2026-05-06 01:00:00',
  },
  {
    id: '6',
    name: '月次集計処理',
    description: '月次の売上・利用統計を集計します',
    status: 'pending',
    lastRunAt: '2026-04-01 03:00:00',
    lastDuration: 183,
    schedule: { frequency: 'monthly', time: '03:00', dayOfMonth: 1 },
    nextRunAt: '2026-06-01 03:00:00',
  },
]

// ── 実行ログ ────────────────────────────────────────────
const RUNS: Record<string, BatchRun[]> = {
  '1': [
    {
      id: 'r1-3',
      startedAt: '2026-05-05 03:00:00',
      finishedAt: '2026-05-05 03:00:12',
      status: 'success',
      duration: 12,
      logs: [
        { timestamp: '03:00:00', level: 'info', message: 'バッチ処理を開始します' },
        { timestamp: '03:00:01', level: 'info', message: 'データベース接続を確立しました' },
        { timestamp: '03:00:02', level: 'info', message: 'ユーザーレコード 1,284 件を取得しました' },
        { timestamp: '03:00:10', level: 'info', message: '差分 32 件を更新しました' },
        { timestamp: '03:00:12', level: 'info', message: 'バッチ処理が正常に完了しました' },
      ],
    },
    {
      id: 'r1-2',
      startedAt: '2026-05-04 03:00:00',
      finishedAt: '2026-05-04 03:00:09',
      status: 'success',
      duration: 9,
      logs: [
        { timestamp: '03:00:00', level: 'info', message: 'バッチ処理を開始します' },
        { timestamp: '03:00:01', level: 'info', message: 'データベース接続を確立しました' },
        { timestamp: '03:00:09', level: 'info', message: 'バッチ処理が正常に完了しました' },
      ],
    },
    {
      id: 'r1-1',
      startedAt: '2026-05-03 03:00:00',
      finishedAt: '2026-05-03 03:00:11',
      status: 'success',
      duration: 11,
      logs: [
        { timestamp: '03:00:00', level: 'info', message: 'バッチ処理を開始します' },
        { timestamp: '03:00:11', level: 'info', message: 'バッチ処理が正常に完了しました' },
      ],
    },
  ],
  '2': [
    {
      id: 'r2-2',
      startedAt: '2026-05-05 06:00:00',
      finishedAt: '2026-05-05 06:00:31',
      status: 'failed',
      duration: 31,
      logs: [
        { timestamp: '06:00:00', level: 'info',  message: 'バッチ処理を開始します' },
        { timestamp: '06:00:01', level: 'info',  message: 'レポートデータを収集中...' },
        { timestamp: '06:00:15', level: 'warn',  message: 'メールサーバーへの接続が遅延しています' },
        { timestamp: '06:00:30', level: 'error', message: 'メールサーバーへの接続がタイムアウトしました (smtp.example.com:587)' },
        { timestamp: '06:00:31', level: 'error', message: 'バッチ処理が失敗しました' },
      ],
    },
    {
      id: 'r2-1',
      startedAt: '2026-04-28 06:00:00',
      finishedAt: '2026-04-28 06:00:22',
      status: 'success',
      duration: 22,
      logs: [
        { timestamp: '06:00:00', level: 'info', message: 'バッチ処理を開始します' },
        { timestamp: '06:00:22', level: 'info', message: 'レポートを 12 件送信しました' },
      ],
    },
  ],
  '3': [
    {
      id: 'r3-1',
      startedAt: '2026-05-05 09:00:00',
      finishedAt: '2026-05-05 09:00:03',
      status: 'success',
      duration: 3,
      logs: [
        { timestamp: '09:00:00', level: 'info', message: 'キャッシュクリアを開始します' },
        { timestamp: '09:00:02', level: 'info', message: '48 エントリを削除しました' },
        { timestamp: '09:00:03', level: 'info', message: '完了しました' },
      ],
    },
  ],
  '4': [
    {
      id: 'r4-1',
      startedAt: '2026-05-05 09:30:00',
      finishedAt: null,
      status: 'running',
      duration: null,
      logs: [
        { timestamp: '09:30:00', level: 'info', message: 'バッチ処理を開始します' },
        { timestamp: '09:30:01', level: 'info', message: '送信待ちメール 23 件を取得しました' },
        { timestamp: '09:30:05', level: 'info', message: '送信中...' },
      ],
    },
  ],
  '5': [
    {
      id: 'r5-1',
      startedAt: '2026-05-05 01:00:00',
      finishedAt: '2026-05-05 01:00:47',
      status: 'success',
      duration: 47,
      logs: [
        { timestamp: '01:00:00', level: 'info', message: 'バックアップを開始します' },
        { timestamp: '01:00:10', level: 'info', message: 'データベースダンプを作成中...' },
        { timestamp: '01:00:45', level: 'info', message: 'ストレージへのアップロード完了 (2.3 GB)' },
        { timestamp: '01:00:47', level: 'info', message: 'バックアップが正常に完了しました' },
      ],
    },
  ],
  '6': [],
}

// ── API ────────────────────────────────────────────────
export async function getBatches(): Promise<BatchJob[]> {
  await new Promise((r) => setTimeout(r, D))
  return [...store]
}

export async function getBatchRuns(batchId: string): Promise<BatchRun[]> {
  await new Promise((r) => setTimeout(r, D))
  return RUNS[batchId] ?? []
}

export async function rerunBatch(batchId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 2500))
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  store = store.map((b) =>
    b.id === batchId
      ? { ...b, status: 'success', lastRunAt: now, lastDuration: Math.floor(Math.random() * 20) + 5 }
      : b,
  )
}

export async function updateBatchSchedule(
  batchId: string,
  schedule: BatchSchedule,
): Promise<void> {
  await new Promise((r) => setTimeout(r, D))
  store = store.map((b) =>
    b.id === batchId ? { ...b, schedule, nextRunAt: computeNextRunAt(schedule) } : b,
  )
}

function computeNextRunAt(schedule: BatchSchedule): string {
  const now = new Date()
  const [h, m] = schedule.time.split(':').map(Number)
  const next = new Date(now)

  if (schedule.frequency === 'hourly') {
    next.setMinutes(0, 0, 0)
    next.setHours(next.getHours() + 1)
  } else if (schedule.frequency === 'daily') {
    next.setHours(h, m, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
  } else if (schedule.frequency === 'weekly') {
    const target = schedule.dayOfWeek ?? 1
    const diff = (target - now.getDay() + 7) % 7 || 7
    next.setDate(now.getDate() + diff)
    next.setHours(h, m, 0, 0)
  } else {
    const target = schedule.dayOfMonth ?? 1
    next.setDate(target)
    next.setHours(h, m, 0, 0)
    if (next <= now) next.setMonth(next.getMonth() + 1)
  }

  return next.toISOString().replace('T', ' ').slice(0, 16)
}
