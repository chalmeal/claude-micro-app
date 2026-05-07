import { useEffect, useRef, useState } from 'react'
import type { BatchFrequency, BatchJob, BatchSchedule } from '@/features/admin/types'
import { updateBatchSchedule } from '@/features/admin/api/batches'
import './BatchModal.css'

type Props = {
  batch: BatchJob
  onClose: () => void
  onSaved: (updated: BatchJob) => void
}

const FREQ_LABELS: Record<BatchFrequency, string> = {
  hourly: '毎時',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
}

const DOW_LABELS = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

function scheduleText(s: BatchSchedule): string {
  if (s.frequency === 'hourly') return '毎時 0分'
  if (s.frequency === 'daily') return `毎日 ${s.time}`
  if (s.frequency === 'weekly') return `毎週 ${DOW_LABELS[s.dayOfWeek ?? 1]} ${s.time}`
  return `毎月 ${s.dayOfMonth ?? 1}日 ${s.time}`
}

export function BatchScheduleModal({ batch, onClose, onSaved }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const [freq, setFreq] = useState<BatchFrequency>(batch.schedule.frequency)
  const [time, setTime] = useState(batch.schedule.time)
  const [dow, setDow] = useState(batch.schedule.dayOfWeek ?? 1)
  const [dom, setDom] = useState(batch.schedule.dayOfMonth ?? 1)
  const [saving, setSaving] = useState(false)

  const schedule: BatchSchedule = {
    frequency: freq,
    time,
    ...(freq === 'weekly' ? { dayOfWeek: dow } : {}),
    ...(freq === 'monthly' ? { dayOfMonth: dom } : {}),
  }

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    try {
      await updateBatchSchedule(batch.id, schedule)
      onSaved({ ...batch, schedule })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="batch-modal-backdrop"
      ref={backdropRef}
      onMouseDown={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
    >
      <div className="batch-modal batch-modal--md" role="dialog" aria-modal="true" tabIndex={-1}>
        <div className="batch-modal__header">
          <div className="batch-modal__header-text">
            <h2 className="batch-modal__title">スケジュール設定</h2>
            <span className="batch-modal__subtitle">{batch.name}</span>
          </div>
          <button className="batch-modal__close" onClick={onClose} aria-label="閉じる">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="batch-modal__body">
          <div className="batch-schedule-form">
            <div className="batch-schedule-form__field">
              <label htmlFor="bs-freq">実行頻度</label>
              <select
                id="bs-freq"
                value={freq}
                onChange={(e) => setFreq(e.target.value as BatchFrequency)}
              >
                {(Object.keys(FREQ_LABELS) as BatchFrequency[]).map((f) => (
                  <option key={f} value={f}>
                    {FREQ_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>

            {freq === 'weekly' && (
              <div className="batch-schedule-form__field">
                <label htmlFor="bs-dow">実行曜日</label>
                <select id="bs-dow" value={dow} onChange={(e) => setDow(Number(e.target.value))}>
                  {DOW_LABELS.map((label, i) => (
                    <option key={i} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {freq === 'monthly' && (
              <div className="batch-schedule-form__field">
                <label htmlFor="bs-dom">実行日</label>
                <input
                  id="bs-dom"
                  type="number"
                  min={1}
                  max={28}
                  value={dom}
                  onChange={(e) => setDom(Number(e.target.value))}
                />
                <span className="batch-schedule-form__hint">1〜28日の範囲で指定してください</span>
              </div>
            )}

            {freq !== 'hourly' && (
              <div className="batch-schedule-form__field">
                <label htmlFor="bs-time">実行時刻</label>
                <input
                  id="bs-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            )}

            <div className="batch-schedule-form__preview">設定内容: {scheduleText(schedule)}</div>
          </div>
        </div>

        <div className="batch-modal__footer">
          <button className="batch-modal__cancel" onClick={onClose}>
            キャンセル
          </button>
          <button className="batch-modal__save" onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
