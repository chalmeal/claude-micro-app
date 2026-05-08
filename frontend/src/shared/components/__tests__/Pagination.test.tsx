import { jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('totalPages が 1 以下のときは何も表示しない', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('ページ番号ボタンをクリックすると onPageChange が呼ばれる', async () => {
    const onPageChange = jest.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: '2 ページ目' }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('「次へ」ボタンをクリックすると currentPage + 1 で呼ばれる', async () => {
    const onPageChange = jest.fn()
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: '次へ' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('「前へ」ボタンをクリックすると currentPage - 1 で呼ばれる', async () => {
    const onPageChange = jest.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: '前へ' }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('1 ページ目のときは「前へ」ボタンが無効', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: '前へ' })).toBeDisabled()
  })

  it('最終ページのときは「次へ」ボタンが無効', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: '次へ' })).toBeDisabled()
  })

  it('現在のページボタンに aria-current="page" が付く', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: '3 ページ目' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('totalPages が 7 以下のときはすべてのページ番号を表示する', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />)
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: `${i} ページ目` })).toBeInTheDocument()
    }
  })

  it('totalPages が 8 以上のときは省略記号を表示する', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={jest.fn()} />)
    expect(screen.getByText('…')).toBeInTheDocument()
  })
})
