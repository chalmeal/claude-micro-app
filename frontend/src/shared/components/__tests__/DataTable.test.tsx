import { jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type Column } from '../DataTable'

type Item = { id: string; name: string; value: number }

const columns: Column<Item>[] = [
  { key: 'name', label: '名前', render: (row) => row.name },
  { key: 'value', label: '値', render: (row) => row.value },
]

const rows: Item[] = [
  { id: '1', name: 'アイテム A', value: 10 },
  { id: '2', name: 'アイテム B', value: 20 },
]

describe('DataTable', () => {
  it('ヘッダーを表示する', () => {
    render(<DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />)
    expect(screen.getByText('名前')).toBeInTheDocument()
    expect(screen.getByText('値')).toBeInTheDocument()
  })

  it('データ行を表示する', () => {
    render(<DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />)
    expect(screen.getByText('アイテム A')).toBeInTheDocument()
    expect(screen.getByText('アイテム B')).toBeInTheDocument()
  })

  it('rows が空のときは emptyMessage を表示する', () => {
    render(<DataTable columns={columns} rows={[]} getRowKey={(r) => r.id} emptyMessage="データなし" />)
    expect(screen.getByText('データなし')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('デフォルトの emptyMessage を表示する', () => {
    render(<DataTable columns={columns} rows={[]} getRowKey={(r) => r.id} />)
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('onRowClick が指定されているときは行をクリックできる', async () => {
    const onRowClick = jest.fn()
    render(
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} onRowClick={onRowClick} />,
    )
    await userEvent.click(screen.getByText('アイテム A'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })

  it('onRowClick が指定されているときは Enter キーでも発火する', async () => {
    const onRowClick = jest.fn()
    render(
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} onRowClick={onRowClick} />,
    )
    const clickableRow = screen.getAllByRole('row')[1]
    clickableRow.focus()
    await userEvent.keyboard('{Enter}')
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })

  it('onRowClick が指定されているときはスペースキーでも発火する', async () => {
    const onRowClick = jest.fn()
    render(
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} onRowClick={onRowClick} />,
    )
    const clickableRow = screen.getAllByRole('row')[1]
    clickableRow.focus()
    await userEvent.keyboard(' ')
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })

  it('onRowClick が未指定のときは tabIndex を設定しない', () => {
    render(<DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />)
    const dataRow = screen.getAllByRole('row')[1]
    expect(dataRow).not.toHaveAttribute('tabindex')
  })

  it('getRowAriaLabel が指定されているときは aria-label を設定する', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        onRowClick={jest.fn()}
        getRowAriaLabel={(r) => `${r.name} を選択`}
      />,
    )
    expect(screen.getAllByRole('row')[1]).toHaveAttribute('aria-label', 'アイテム A を選択')
  })

  it('className prop が table ラッパーに適用される', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} className="custom-table" />,
    )
    expect(container.firstChild).toHaveClass('custom-table')
  })
})
