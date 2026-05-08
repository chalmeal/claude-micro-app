import { jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

function ThrowError({ message }: { message: string }): JSX.Element {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('エラーがない場合は children を表示する', () => {
    render(
      <ErrorBoundary>
        <p>正常コンテンツ</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('正常コンテンツ')).toBeInTheDocument()
  })

  it('エラーが発生した場合はデフォルトのフォールバックを表示する', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="テストエラー" />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('テストエラー')).toBeInTheDocument()
  })

  it('カスタム fallback を表示する', () => {
    render(
      <ErrorBoundary fallback={<p>エラーが発生しました</p>}>
        <ThrowError message="エラー" />
      </ErrorBoundary>,
    )
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
  })
})
