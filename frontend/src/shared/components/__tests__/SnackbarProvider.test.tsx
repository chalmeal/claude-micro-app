import { jest } from '@jest/globals'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from '../Snackbar'
import { useSnackbar } from '@/shared/hooks/useSnackbar'

function TestConsumer({ message, variant }: { message: string; variant?: 'success' | 'error' }) {
  const { show } = useSnackbar()
  return <button onClick={() => show(message, variant)}>通知を表示</button>
}

describe('SnackbarProvider', () => {
  it('children を表示する', () => {
    render(
      <SnackbarProvider>
        <p>子コンテンツ</p>
      </SnackbarProvider>,
    )
    expect(screen.getByText('子コンテンツ')).toBeInTheDocument()
  })

  it('show() を呼ぶとスナックバーが表示される', async () => {
    render(
      <SnackbarProvider>
        <TestConsumer message="保存しました" />
      </SnackbarProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: '通知を表示' }))
    expect(screen.getByText('保存しました')).toBeInTheDocument()
  })

  it('success バリアントのクラスが付く', async () => {
    render(
      <SnackbarProvider>
        <TestConsumer message="成功" variant="success" />
      </SnackbarProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: '通知を表示' }))
    expect(screen.getByRole('status')).toHaveClass('snackbar--success')
  })

  it('error バリアントのクラスが付く', async () => {
    render(
      <SnackbarProvider>
        <TestConsumer message="エラー" variant="error" />
      </SnackbarProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: '通知を表示' }))
    expect(screen.getByRole('status')).toHaveClass('snackbar--error')
  })

  it('3 秒後にスナックバーが消える', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) })
    render(
      <SnackbarProvider>
        <TestConsumer message="消えるメッセージ" />
      </SnackbarProvider>,
    )
    await user.click(screen.getByRole('button', { name: '通知を表示' }))
    expect(screen.getByText('消えるメッセージ')).toBeInTheDocument()

    act(() => { jest.advanceTimersByTime(3000) })
    expect(screen.queryByText('消えるメッセージ')).not.toBeInTheDocument()

    jest.useRealTimers()
  })

  it('aria-live="polite" コンテナを持つ', () => {
    const { container } = render(
      <SnackbarProvider>
        <span />
      </SnackbarProvider>,
    )
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })
})
