import { jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserFilterForm } from '../UserFilterForm'
import type { UserFilters } from '@/features/users/types'

const baseFilters: UserFilters = {
  keyword: '',
  role: '',
  status: '',
  dateFrom: '',
  dateTo: '',
}

describe('UserFilterForm', () => {
  it('フィルターフィールドを表示する', () => {
    render(<UserFilterForm onSubmit={jest.fn()} />)
    expect(screen.getByLabelText('キーワード')).toBeInTheDocument()
    expect(screen.getByLabelText('ロール')).toBeInTheDocument()
    expect(screen.getByLabelText('ステータス')).toBeInTheDocument()
    expect(screen.getByLabelText('登録日(開始)')).toBeInTheDocument()
    expect(screen.getByLabelText('登録日(終了)')).toBeInTheDocument()
  })

  it('検索ボタンをクリックすると onSubmit が現在の値で呼ばれる', async () => {
    const onSubmit = jest.fn()
    render(<UserFilterForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('キーワード'), '田中')
    await userEvent.click(screen.getByRole('button', { name: '検索' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: '田中' }),
    )
  })

  it('ロールを選択してサブミットすると onSubmit が呼ばれる', async () => {
    const onSubmit = jest.fn()
    render(<UserFilterForm onSubmit={onSubmit} />)
    await userEvent.selectOptions(screen.getByLabelText('ロール'), 'admin')
    await userEvent.click(screen.getByRole('button', { name: '検索' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }))
  })

  it('ステータスを選択してサブミットすると onSubmit が呼ばれる', async () => {
    const onSubmit = jest.fn()
    render(<UserFilterForm onSubmit={onSubmit} />)
    await userEvent.selectOptions(screen.getByLabelText('ステータス'), 'inactive')
    await userEvent.click(screen.getByRole('button', { name: '検索' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: 'inactive' }))
  })

  it('リセットボタンをクリックするとフィールドが初期値に戻る', async () => {
    const onReset = jest.fn()
    render(<UserFilterForm onSubmit={jest.fn()} onReset={onReset} />)
    await userEvent.type(screen.getByLabelText('キーワード'), '鈴木')
    await userEvent.click(screen.getByRole('button', { name: 'リセット' }))
    expect(screen.getByLabelText('キーワード')).toHaveValue('')
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('initialFilters で初期値を設定できる', () => {
    const initialFilters: UserFilters = { ...baseFilters, keyword: '初期キーワード', role: 'admin' }
    render(<UserFilterForm onSubmit={jest.fn()} initialFilters={initialFilters} />)
    expect(screen.getByLabelText('キーワード')).toHaveValue('初期キーワード')
    expect(screen.getByLabelText('ロール')).toHaveValue('admin')
  })
})
