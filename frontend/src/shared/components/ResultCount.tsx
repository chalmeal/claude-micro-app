import './ResultCount.css'

type Props = {
  total: number
  rangeStart: number
  rangeEnd: number
  emptyMessage: string
  totalRaw?: number
}

export function ResultCount({ total, rangeStart, rangeEnd, emptyMessage, totalRaw }: Props) {
  if (total === 0) return <p className="result-count">{emptyMessage}</p>

  const extra = totalRaw !== undefined ? ` (全 ${totalRaw} 件)` : ''
  return (
    <p className="result-count">
      {rangeStart}–{rangeEnd} 件 / {total} 件{extra}
    </p>
  )
}
