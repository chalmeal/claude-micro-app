import { render, screen } from '@testing-library/react'
import { ErrorAlert } from '../ErrorAlert'

describe('ErrorAlert', () => {
  it('error が null のときは何も表示しない', () => {
    const { container } = render(<ErrorAlert error={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('error が undefined のときは何も表示しない', () => {
    const { container } = render(<ErrorAlert error={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('Error オブジェクトのメッセージを表示する', () => {
    render(<ErrorAlert error={new Error('接続に失敗しました')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('接続に失敗しました')
  })

  it('文字列のエラーをそのまま表示する', () => {
    render(<ErrorAlert error="サーバーエラーが発生しました" />)
    expect(screen.getByRole('alert')).toHaveTextContent('サーバーエラーが発生しました')
  })

  it('デフォルトの prefix を含む', () => {
    render(<ErrorAlert error="Not Found" />)
    expect(screen.getByRole('alert')).toHaveTextContent('データの読み込みに失敗しました')
  })

  it('カスタム prefix を表示する', () => {
    render(<ErrorAlert error="タイムアウト" prefix="ユーザー情報の取得に失敗しました" />)
    expect(screen.getByRole('alert')).toHaveTextContent('ユーザー情報の取得に失敗しました: タイムアウト')
  })

  it('role="alert" 属性を持つ', () => {
    render(<ErrorAlert error="エラー" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
