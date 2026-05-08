import type { KeyboardEvent, ReactNode } from 'react'
import './DataTable.css'

export type Column<T> = {
  key: string
  label: string
  render: (row: T) => ReactNode
  className?: string
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  onRowClick?: (row: T) => void
  getRowAriaLabel?: (row: T) => string
  emptyMessage?: string
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  getRowAriaLabel,
  emptyMessage = 'データがありません',
  className,
}: Props<T>) {
  if (rows.length === 0) {
    return <p className="data-table__empty">{emptyMessage}</p>
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTableRowElement>, row: T) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onRowClick?.(row)
    }
  }

  const clickable = !!onRowClick
  const wrapperClass = ['data-table', className].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      <table className="data-table__table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className={
                clickable ? 'data-table__row data-table__row--clickable' : 'data-table__row'
              }
              tabIndex={clickable ? 0 : undefined}
              aria-label={getRowAriaLabel?.(row)}
              onClick={clickable ? () => onRowClick(row) : undefined}
              onKeyDown={clickable ? (e) => handleKeyDown(e, row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  data-label={col.label || undefined}
                  className={col.className}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
