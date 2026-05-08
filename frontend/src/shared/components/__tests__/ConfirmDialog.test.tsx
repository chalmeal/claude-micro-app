import { jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../ConfirmDialog'

function renderDialog(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = jest.fn()
  const onCancel = jest.fn()
  render(
    <ConfirmDialog
      title="削除の確認"
      message="本当に削除しますか？"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('タイトルとメッセージを表示する', () => {
    renderDialog()
    expect(screen.getByText('削除の確認')).toBeInTheDocument()
    expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument()
  })

  it('デフォルトのボタンラベルを表示する', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('カスタムのボタンラベルを表示する', () => {
    renderDialog({ confirmLabel: '削除する', cancelLabel: '戻る' })
    expect(screen.getByRole('button', { name: '削除する' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument()
  })

  it('確認ボタンをクリックすると onConfirm が呼ばれる', async () => {
    const { onConfirm } = renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('キャンセルボタンをクリックすると onCancel が呼ばれる', async () => {
    const { onCancel } = renderDialog()
    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('Escape キーを押すと onCancel が呼ばれる', async () => {
    const { onCancel } = renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('バックドロップをクリックすると onCancel が呼ばれる', async () => {
    const { onCancel } = renderDialog()
    const backdrop = screen.getByRole('alertdialog')
    await userEvent.pointer({ target: backdrop, keys: '[MouseLeft]' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('role="alertdialog" を持つ', () => {
    renderDialog()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('details が指定されているときは表示する', () => {
    renderDialog({ details: <span>詳細情報</span> })
    expect(screen.getByText('詳細情報')).toBeInTheDocument()
  })
})
