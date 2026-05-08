import { render, screen } from '@testing-library/react'
import { ResultCount } from '../ResultCount'

describe('ResultCount', () => {
  it('total が 0 のときは emptyMessage を表示する', () => {
    render(
      <ResultCount total={0} rangeStart={0} rangeEnd={0} emptyMessage="データがありません" />,
    )
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('件数範囲を表示する', () => {
    render(<ResultCount total={50} rangeStart={1} rangeEnd={20} emptyMessage="" />)
    expect(screen.getByText('1–20 件 / 50 件')).toBeInTheDocument()
  })

  it('totalRaw が指定されている場合は全件数を追記する', () => {
    render(
      <ResultCount total={10} rangeStart={1} rangeEnd={10} emptyMessage="" totalRaw={100} />,
    )
    expect(screen.getByText('1–10 件 / 10 件 (全 100 件)')).toBeInTheDocument()
  })

  it('totalRaw が未指定の場合は全件数を表示しない', () => {
    render(<ResultCount total={30} rangeStart={1} rangeEnd={30} emptyMessage="" />)
    expect(screen.queryByText(/全/)).not.toBeInTheDocument()
  })
})
