import { render } from '@testing-library/react'
import { SkeletonRows } from '../SkeletonRows'

describe('SkeletonRows', () => {
  it('デフォルトで 5 行表示する', () => {
    const { container } = render(<SkeletonRows />)
    const rows = container.querySelectorAll('.skeleton-rows__row')
    expect(rows).toHaveLength(5)
  })

  it('count prop で行数を指定できる', () => {
    const { container } = render(<SkeletonRows count={3} />)
    const rows = container.querySelectorAll('.skeleton-rows__row')
    expect(rows).toHaveLength(3)
  })

  it('aria-busy="true" 属性を持つ', () => {
    const { container } = render(<SkeletonRows />)
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
  })

  it('デフォルトの rowHeight (36px) のときは inline style を設定しない', () => {
    const { container } = render(<SkeletonRows rowHeight={36} />)
    const row = container.querySelector('.skeleton-rows__row')
    expect(row).not.toHaveStyle({ height: '36px' })
  })

  it('カスタム rowHeight のときは inline style を設定する', () => {
    const { container } = render(<SkeletonRows rowHeight={60} />)
    const row = container.querySelector('.skeleton-rows__row')
    expect(row).toHaveStyle({ height: '60px' })
  })
})
